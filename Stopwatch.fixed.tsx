import * as React from "react";
import * as ReactDOM from "react-dom";

const formattedSeconds = (sec: number) =>
  Math.floor(sec / 60) + ":" + ("0" + (sec % 60)).slice(-2);

interface StopwatchProps extends React.ClassAttributes<Stopwatch> {
  initialSeconds: number;
}

interface StopwatchState {
  secondsElapsed: number;
  isStarted: boolean;
  laps: number[];
}

class Stopwatch extends React.Component<StopwatchProps, StopwatchState> {
  incrementer: any;

  constructor(props: StopwatchProps) {
    super(props);
    this.state = {
      secondsElapsed: props.initialSeconds || 0,
      isStarted: false,
      laps: [],
    };
  }

  componentWillUnmount() {
    clearInterval(this.incrementer);
  }

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
    this.setState({ isStarted: false });
  };

  handleResetClick = () => {
    clearInterval(this.incrementer);
    this.setState({
      secondsElapsed: this.props.initialSeconds,
      laps: [],
    });
  };

  handleLapClick = () => {
    this.setState({ laps: [...this.state.laps, this.state.secondsElapsed] });
  };

  handleDeleteClick = (id: number) => {
    const filteredLaps = this.state.laps.filter((lap, index) => index !== id);
    this.setState({ laps: filteredLaps });
  };

  render() {
    const { secondsElapsed, isStarted, laps } = this.state;
    return (
      <div className="stopwatch">
        <h1 className="stopwatch-timer">{formattedSeconds(secondsElapsed)}</h1>
        {secondsElapsed === this.props.initialSeconds || !isStarted ? (
          <button
            type="button"
            className="start-btn"
            onClick={this.handleStartClick}
          >
            start
          </button>
        ) : (
          <button
            type="button"
            className="stop-btn"
            onClick={this.handleStopClick}
          >
            stop
          </button>
        )}
        {secondsElapsed !== this.props.initialSeconds && isStarted ? (
          <button type="button" onClick={this.handleLapClick}>
            lap
          </button>
        ) : null}
        {secondsElapsed !== this.props.initialSeconds && !isStarted ? (
          <button type="button" onClick={this.handleResetClick}>
            reset
          </button>
        ) : null}
        <div className="stopwatch-laps">
          {laps.map((lap: number, index: number) => (
            <Lap
              key={index}
              id={index}
              lap={lap}
              onDelete={this.handleDeleteClick}
            />
          ))}
        </div>
      </div>
    );
  }
}

interface Props {
  id: number;
  lap: number;
  onDelete: (id: number) => void;
}

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

ReactDOM.render(
  <Stopwatch initialSeconds={0} />,
  document.getElementById("content")
);
