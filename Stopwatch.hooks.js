import { useEffect, useState } from "react";
import ReactDOM from "react-dom";

const formattedSeconds = (sec) =>
  Math.floor(sec / 60) + ":" + ("0" + (sec % 60)).slice(-2);

export default function Stopwatch({ initialSeconds }) {
  const [isStarted, setIsStarted] = useState(false);
  const [secondsElapsed, setSecondsElapsed] = useState(initialSeconds || 0);
  const [laps, setLaps] = useState([]);

  useEffect(() => {
    if (isStarted) {
      const incrementer = setInterval(() => {
        setSecondsElapsed(secondsElapsed + 1);
      }, 1000);
      return function cleanup() {
        clearInterval(incrementer);
      };
    }
  }, [secondsElapsed, isStarted]);

  function handleStartClick() {
    setIsStarted(true);
  }

  function handleStopClick() {
    setIsStarted(false);
  }

  function handleResetClick() {
    setSecondsElapsed(initialSeconds);
    setLaps([]);
  }

  function handleLapClick() {
    setLaps([...laps, secondsElapsed]);
  }

  function handleDeleteClick(id) {
    setLaps((prevLaps) => {
      return prevLaps.filter((lap, index) => {
        return index !== id;
      });
    });

    // setLaps((prevLaps) => {
    //   const laps = [...prevLaps];
    //   laps.splice(index, 1);
    //   return laps;
    // });
  }

  return (
    <div className="stopwatch">
      <h1 className="stopwatch-timer">{formattedSeconds(secondsElapsed)}</h1>
      {secondsElapsed === initialSeconds || !isStarted ? (
        <button type="button" className="start-btn" onClick={handleStartClick}>
          start
        </button>
      ) : (
        <button type="button" className="stop-btn" onClick={handleStopClick}>
          stop
        </button>
      )}
      {secondsElapsed !== initialSeconds && isStarted ? (
        <button type="button" onClick={handleLapClick}>
          lap
        </button>
      ) : null}
      {secondsElapsed !== initialSeconds && !isStarted ? (
        <button type="button" onClick={handleResetClick}>
          reset
        </button>
      ) : null}
      <div className="stopwatch-laps">
        {laps.map((lap, index) => (
          <Lap key={index} id={index} lap={lap} onDelete={handleDeleteClick} />
        ))}
      </div>
    </div>
  );
}

export function Lap({ id, lap, onDelete }) {
  function handleDelete() {
    onDelete(id);
  }

  return (
    <div className="stopwatch-lap">
      <strong>{id}</strong>/ {formattedSeconds(lap)}
      <button onClick={handleDelete}> X </button>
    </div>
  );
}

ReactDOM.render(
  <Stopwatch initialSeconds={0} />,
  document.getElementById("content")
);
