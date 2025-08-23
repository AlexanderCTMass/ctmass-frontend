import React from 'react';
import ReactMapboxAutocomplete from 'react-mapbox-autocomplete';
import { mapboxConfig } from "src/config";

export const CustomMapboxAutocomplete = (props) => {
  const { onSelect, placeholder, inputClass, ...rest } = props;

  return (
    <>
      <ReactMapboxAutocomplete
        publicKey={mapboxConfig.apiKey}
        onSuggestionSelect={onSelect}
        inputClass="custom-input"
        placeholder={placeholder}
        {...rest}
      />
      <style>
        {`
          .custom-input {
            width: 100%;
            padding: 16.5px 14px;
            font-size: 16px;
            color: #333;
            border: 1px solid #c4c4c4;
            border-radius: 4px;
            outline: none;
            box-sizing: border-box;
            transition: border-color 0.3s ease, box-shadow 0.3s ease;
          }

          .custom-input:hover {
            border-color: #3f51b5; /* Цвет primary из MUI */
          }

          .custom-input:focus {
            border-color: #3f51b5;
            box-shadow: 0 0 0 2px rgba(63, 81, 181, 0.25);
          }

          .custom-input:disabled {
            background-color: #f5f5f5;
            cursor: not-allowed;
            border-color: #e0e0e0;
          }
        `}
      </style>
    </>
  );
}
