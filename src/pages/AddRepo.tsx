import React, { useState } from "react";
import { useOatmilk } from "oatmilk";
import Button from "../components/Button/Button";
import TextInput from "../components/TextInput/TextInput";

const re = /^[\w-]+\/[\w-]+$/;

function AddRepo() {
  const { goTo } = useOatmilk();
  const [isInvalid, setIsInvalid] = useState(false);
  const [input, setInput] = useState("");

  const onClick = () => {
    if (!re.test(input)) {
      return setIsInvalid(true);
    }

    const [owner, repo] = input.split("/");

    goTo("milestones", {
      owner,
      repo,
    });
  };

  return (
    <div className="content">
      <div className="title">Add a Repo</div>
      <div className="paragraph">
        Type the name of a GitHub repo that has milestones with issues
        associated.
      </div>
      <div>
        <TextInput
          placeholder="owner/repo"
          invalidMessage={isInvalid && "Input does not match 'owner/repo'"}
          onChange={setInput}
          button={<Button onClick={onClick}>Add</Button>}
        />
      </div>
    </div>
  );
}

export default AddRepo;
