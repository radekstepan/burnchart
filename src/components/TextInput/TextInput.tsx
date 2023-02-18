import React, { cloneElement, ReactElement } from "react";
import { cls } from "../../utils/css";
import "./textInput.less";

interface Props {
  placeholder: string;
  invalidMessage?: string | false;
  onChange?: (input: string) => void;
  button?: ReactElement;
}

const TextInput: React.FC<Props> = ({
  placeholder,
  invalidMessage,
  button,
  onChange,
}) => {
  const className = "text-input";

  return (
    <div className={className}>
      <div className={`${className}__group`}>
        <input
          className={cls(
            `${className}__input`,
            button && `${className}__input--with-button`
          )}
          type="text"
          aria-invalid={!!invalidMessage}
          placeholder={placeholder}
          {...(onChange && {
            onChange: (evt) => onChange(evt.currentTarget.value),
          })}
        />
        {button
          ? cloneElement(button, {
              withInput: true,
            })
          : null}
      </div>
      {invalidMessage && (
        <div className={`${className}__message`}>{invalidMessage}</div>
      )}
    </div>
  );
};

export default TextInput;
