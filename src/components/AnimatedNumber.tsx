import { useState, useEffect } from "react";

const AnimatedNumber = ({ value }: {value: number}) => {
  const [displayValue, setDisplayValue] = useState(value);

  useEffect(() => {
    const duration = 400;
    const startValue = displayValue;
    const endValue = value;
    const startTime =  performance.now();

    const updateValue = (currentTime: number) => {
      const elapsedTime = currentTime - startTime;
      const progress = Math.min(elapsedTime / duration, 1); // Clamp to 0-1
      const interpolatedValue = Math.floor(
        startValue + progress * (endValue - startValue)
      );

      setDisplayValue(interpolatedValue);

      if (progress < 1) {
        requestAnimationFrame(updateValue);
      }
    };

    requestAnimationFrame(updateValue);
  }, [value]);

  return <span>{displayValue}</span>;
}

export default AnimatedNumber;