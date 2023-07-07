import { useEffect } from "react";
import { useTimer } from "react-timer-hook";

export default function Timer(props: {
  secondsToExpire: number;
  onExpire?: () => void;
}) {
  const secondsToExpire = props.secondsToExpire;
  const timeToExpire = new Date();
  timeToExpire.setSeconds(timeToExpire.getSeconds() + secondsToExpire);
  const { seconds, restart, start, isRunning } = useTimer({
    expiryTimestamp: timeToExpire,
    autoStart: false,
    onExpire: props.onExpire,
  });

  useEffect(() => {
    if (secondsToExpire && !isRunning) {
      const time = new Date();
      time.setSeconds(time.getSeconds() + secondsToExpire);
      start();
    }
  }, [secondsToExpire, restart, isRunning]);

  return (
    <svg
      viewBox="0 0 100 100"
      className="max-h-40"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle
        className="stroke-amber-400"
        cx="50"
        cy="50"
        r="48"
        fill="none"
        pathLength="360"
        strokeDasharray="370"
        strokeWidth={3}
        transform="rotate(-90,50,50)"
      >
        <animate
          attributeName="stroke-dashoffset"
          dur={secondsToExpire}
          values="0;-370"
        ></animate>
      </circle>
      <text
        x="50"
        y="50"
        alignmentBaseline="central"
        textAnchor="middle"
        className="fill-stone-600"
      >
        {seconds}
      </text>
    </svg>
  );
}
