import { useState, useEffect } from "react";

const AnimatedNumber = ({ value }: { value: number }) => {
  const [displayValue, setDisplayValue] = useState(value);

  useEffect(() => {
    const duration = 400;
    const endValue = value;
    const startTime = performance.now();

    const updateValue = (currentTime: number) => {
      const elapsedTime = currentTime - startTime;
      const progress = Math.min(elapsedTime / duration, 1);

      setDisplayValue((prev) =>
        Math.floor(prev + progress * (endValue - prev)),
      );

      if (progress < 1) {
        requestAnimationFrame(updateValue);
      }
    };

    requestAnimationFrame(updateValue);
  }, [value]);

  return <div>{displayValue}</div>;
};

export default AnimatedNumber;
