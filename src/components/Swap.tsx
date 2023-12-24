import * as React from 'react';

export interface SwapProps {
  renderOn: React.ReactElement;
  renderOff: React.ReactElement;
  type?: 'rotate' | 'flip' | 'active';
  className?: string;
  checked?: boolean;
  onChange?: (c: boolean) => void;
}

export function Swap(props: SwapProps) {
  const { renderOff, renderOn, className, type, checked, onChange } = props;
  return (
    <label className={`swap ${type ? `swap-${type}` : undefined} ${className}`}>
      {/* this hidden checkbox controls the state */}
      <input
        type="checkbox"
        {...(checked !== undefined && { checked })}
        {...(onChange && { onChange: (e) => onChange(e.target.checked) })}
      />

      {React.cloneElement(renderOn, {
        className: `${renderOn.props.className} swap-on`,
      })}

      {React.cloneElement(renderOff, {
        className: `${renderOff.props.className} swap-off`,
      })}
    </label>
  );
}
