import { useEffect, useState, MouseEvent } from "react";
import { generateRandomNumber } from "shared/helpers";

import "assets/sass/ripple.sass";

type RippleArrayType = {
  x: number;
  y: number;
  size: any;
};

const Ripple = () => {
  const [rippleArray, setRippleArray] = useState<RippleArrayType[]>([]);

  const addRipple = (event: MouseEvent<HTMLDivElement>) => {
    const rippleContainer = event.currentTarget.getBoundingClientRect();
    const size =
      rippleContainer.width > rippleContainer.height
        ? rippleContainer.width
        : rippleContainer.height;
    const x = event.pageX - (rippleContainer.x + window.pageXOffset) - size / 2;
    const y = event.pageY - (rippleContainer.y + window.pageYOffset) - size / 2;
    const newRipple = { x, y, size };
    setRippleArray([newRipple]);
  };

  useEffect(() => {
    let bounce: any;
    if (rippleArray.length > 0) {
      window.clearTimeout(bounce);
      bounce = window.setTimeout(() => {
        setRippleArray([]);
        window.clearTimeout(bounce);
      }, 3400);
    }
    return () => window.clearTimeout(bounce);
  }, [rippleArray.length]);

  return (
    <div
      onMouseDown={addRipple}
      className="ripple-container"
      role="button"
      tabIndex={0}
    >
      {(rippleArray.length &&
        rippleArray.map((ripple) => (
          <span
            key={generateRandomNumber()}
            style={{
              top: ripple.y,
              left: ripple.x,
              width: ripple.size,
              height: ripple.size,
            }}
          />
        ))) ||
        null}
    </div>
  );
};

export { Ripple };
