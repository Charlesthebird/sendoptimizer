import React from "react";
import { Alert } from "react-bootstrap";
import { BsInfoCircle } from "react-icons/bs";

interface IInfoAlert {
  title?: string;
  body: any;
}
export const InfoAlert: React.FC<IInfoAlert> = ({ title, body }) => {
  if (title)
    return (
      <Alert variant="success">
        <Alert.Heading>
          <BsInfoCircle />
          &nbsp;&nbsp;{title}
        </Alert.Heading>
        {body}
      </Alert>
    );
  else
    return (
      <Alert variant="success">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "2rem auto",
            fontSize: "1.25rem",
          }}
        >
          <div>
            <BsInfoCircle />
          </div>
          <div>{body}</div>
        </div>
      </Alert>
    );
};
