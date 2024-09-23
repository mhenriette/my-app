import React from "react";

export default function WaveLoading() {
  return (
    <div className="flex items-center justify-center w-full h-40">
      <svg
        className="w-full h-full max-w-sm"
        viewBox="0 0 120 30"
        xmlns="http://www.w3.org/2000/svg"
        fill="currentColor"
      >
        <circle className="wave" cx="15" cy="15" r="7.5">
          <animate
            attributeName="cy"
            from="15"
            to="15"
            dur="1s"
            values="15;20;15;10;15"
            keyTimes="0;0.25;0.5;0.75;1"
            repeatCount="indefinite"
          />
        </circle>
        <circle className="wave" cx="45" cy="15" r="7.5">
          <animate
            attributeName="cy"
            from="15"
            to="15"
            dur="1s"
            values="15;20;15;10;15"
            keyTimes="0;0.25;0.5;0.75;1"
            repeatCount="indefinite"
            begin="0.1s"
          />
        </circle>
        <circle className="wave" cx="75" cy="15" r="7.5">
          <animate
            attributeName="cy"
            from="15"
            to="15"
            dur="1s"
            values="15;20;15;10;15"
            keyTimes="0;0.25;0.5;0.75;1"
            repeatCount="indefinite"
            begin="0.2s"
          />
        </circle>
        <circle className="wave" cx="105" cy="15" r="7.5">
          <animate
            attributeName="cy"
            from="15"
            to="15"
            dur="1s"
            values="15;20;15;10;15"
            keyTimes="0;0.25;0.5;0.75;1"
            repeatCount="indefinite"
            begin="0.3s"
          />
        </circle>
      </svg>
    </div>
  );
}
