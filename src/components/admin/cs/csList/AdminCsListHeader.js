import React, { useState } from "react";

const AdminCsListHeader = ({ view }) => {
  const getTitle = () => {
    switch (view) {
      case "list":
        return "게시할 문의글 목록";

      case "modify":
        return "게시할 문의글 수정";

      case "write":
        return "게시할 문의글 작성";

      default:
        return "게시할 문의글 목록";
    }
  };

  return (
    <div>
      <h2
        style={
          view === "modify"
            ? {
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }
            : {
                display: "flex",
                justifyContent: "start",
                alignItems: "center",
              }
        }
      >
        {getTitle()}
      </h2>
    </div>
  );
};

export default AdminCsListHeader;
