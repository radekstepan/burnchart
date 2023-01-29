import React, { memo, useEffect, useState } from "react";
import { Pane, Spinner } from "evergreen-ui";

function Loading() {
  return (
    <Pane display="flex" justifyContent="center">
      <Spinner />
    </Pane>
  );
}

export default Loading;
