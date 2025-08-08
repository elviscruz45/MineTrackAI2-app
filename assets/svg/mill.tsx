import * as React from "react";
import Svg, { Path } from "react-native-svg";
const SVGComponent = (props: any) => (
  <Svg
    width={99}
    height={104}
    viewBox="0 0 99 104"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <Path
      d="M5.5 63.5L1.5 42L38 23M5.5 63.5L42 45M5.5 63.5L12.5 83.5M42 45L38 23M42 45L50 63.5M42 45L80 23M38 23L76.5 1.5L80 23M12.5 83.5L50 63.5M12.5 83.5L24 102.5L61.5 83.5M50 63.5L61.5 83.5M50 63.5L87 42M61.5 83.5L97.5 63.5L87 42M87 42L80 23"
      stroke="black"
    />
  </Svg>
);
export default SVGComponent;
