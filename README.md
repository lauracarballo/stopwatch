# Stopwatch

## Corrections

### Binding functions

There is a problem with the binding of functions throughout the component. Event handlers are callback functions so when they are being called the `this` reference gets called inside a new context. Consequently, if the event handler is not hard bind to the function that triggers the event, it will return undefined when it gets called, which is what's happening entirely through the component.

This can be fixed by using the `.bind` method or simply adding an arrow function as I have chosen to do:

```js
handleResetClick = () => {
  clearInterval(this.incrementer);
  this.setState({
    secondsElapsed: this.props.initialSeconds,
    laps: [],
  });
};
```

### Controlling `laps` with state

In this case we need to consider that the component in the React lifecycle only re-renders if the props passed to it or its state changes. While there are some cases for using `forceUpdate()` method, it is better to use hooks, state, props and context to re-render the component.

In the original file, `laps` is a variable which contains an array that stores the `secondsElapsed`. When the button "lap" is clicked and we trigger the `handleLapClick()`, since React is not handling the state of `laps`, we need to call `forceUpdate()` after updating the array. We are forcing a re-rendering which should be handled automatically by React.

```js
constructor(props: StopwatchClassProps) {
    super(props);
    this.state = {
      secondsElapsed: props.initialSeconds,
      lastClearedIncrementer: null,
      laps: [],
    };
    // this.laps: []
  }
```

This change also affects the `handleResetClick()` function which will now `setState` to an empty array.

```js
handleResetClick = () => {
  clearInterval(this.incrementer);
  // (this.laps = []),
  this.setState({
    secondsElapsed: this.props.initialSeconds,
    laps: [],
  });
};
```

In the previous version, the lap and delete button were not working properly either.

- `handleLapClick` will now update the `laps` array and add the `secondsElapsed` whenever it gets triggered without having to `forceUpdate()`

```js
handleLapClick = () => {
  // this.laps = this.laps.concat([this.state.secondsElapsed]);
  // this.forceUpdate();
  this.setState({ laps: [...this.state.laps, this.state.secondsElapsed] });
};
```

- The original `handleDeleteClick` function uses the `.splice` method to delete the selected item from the array. The `.splice` method only changes the contents of an array, meaning it does not create a new array and consequently force a re-render. To use this method we need to create a new `laps` array from the `[...prevLaps]` and then use the `.splice` method on it. For better readability I would use a `.filter` method as shown:

```js
handleDeleteClick = (id: number) => {
  const filteredLaps = this.state.laps.filter((lap, index) => index !== id);
  this.setState({ laps: filteredLaps });
  // return () => this.laps.splice(index, 1);
};
```

I also added a `handleDelete` function to the Lap component so it's clearer to see that the `onDelete` function passes the `id` as `props`.

```js
const Lap = ({ id, lap, onDelete }: Props) => {
  function handleDelete() {
    onDelete(id);
  }

  return (
    <div className="stopwatch-lap">
      <strong>{id}</strong>/ {formattedSeconds(lap)}
      <button onClick={handleDelete}> X </button>
    </div>
  );
};
```

### Rendering buttons with state

One of the main issues with the original component is that it tries to handle the rendering of the buttons using the `incrementer` function and when it was last cleared, `lastClearedIncrementer`. The value returned by any `setInterval()` function is a id (number) that represents when the function was called so it can be cleared calling `clearInterval()`. We should not make the rendering of the component dependant of this value.

As mention before, the rendering of the buttons should be handled in the component's state. Changing `lastClearedIncrementer` for `isStarted` solves the problem. We can now control when the Stopwatch has started or is stopped and render the buttons accordingly.

```js
constructor(props: StopwatchClassProps) {
    super(props);
    this.state = {
      secondsElapsed: props.initialSeconds,
      //lastClearedIncrementer: null,
      isStarted: false,
      laps: [],
    };
  }
```

`isStarted` should now be added to the `handleStartClick` and `handleStopClick` function so we can toggle it's state too.

```js
handleStartClick = () => {
  this.setState({ isStarted: true });

  this.incrementer = setInterval(
    () =>
      this.setState({
        secondsElapsed: this.state.secondsElapsed + 1,
      }),
    1000
  );
};

handleStopClick = () => {
  clearInterval(this.incrementer);
  //   this.setState({
  //       lastClearedIncrementer: this.incrementer,
  //     });
  this.setState({ isStarted: false });
};
```

The `render()` method will now render according to the `isStarted` and `secondsElapsed` states, which results also in a more readable and cleaner code.

```js
{
  secondsElapsed === this.props.initialSeconds || !isStarted ? (
    <button type="button" className="start-btn" onClick={this.handleStartClick}>
      start
    </button>
  ) : (
    <button type="button" className="stop-btn" onClick={this.handleStopClick}>
      stop
    </button>
  );
}
```

```js
{
  secondsElapsed !== this.props.initialSeconds && isStarted ? (
    <button type="button" onClick={this.handleLapClick}>
      lap
    </button>
  ) : null;
}
```

```js
{
  secondsElapsed !== this.props.initialSeconds && !isStarted ? (
    <button type="button" onClick={this.handleResetClick}>
      reset
    </button>
  ) : null;
}
```

### Add componentWillUnmount()

In the old implementation, the Stopwatch will run until it is only explicitly stopped. But to avoid memory leaks we should stop the Stopwatch when the component is not mounted, the lifecycle method componentWillUnmount will clear all processes when the component is unmounted (removed) from the DOM.

```js
  componentWillUnmount() {
    clearInterval(this.incrementer);
  }
```

### Hooks

I have added a file which uses hooks to build the Stopwatch component. When using hooks the logic behind the component's state is more managable, we can avoid using `this` which was causing bugs in the original code and we can benefit from the `useEffect` hook to keep related logic in the same place.
