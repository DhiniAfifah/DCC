import * as React from "react";

export interface LabelProps
  extends React.LabelHTMLAttributes<HTMLLabelElement> {}

export const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  (props, ref) => {
    return (
      <label
        ref={ref}
        className="text-sm font-semibold text-gray-700"
        {...props}
      />
    );
  }
);

Label.displayName = "Label";
