import React, { useState } from "react";
import { useOatmilk } from "oatmilk";
import Content from "../components/Content/Content";
import Button from "../components/Button/Button";
import TextInput from "../components/TextInput/TextInput";
import { Paragraph, Title } from "../components/Text/Text";

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
    <Content slim title="Add a Repo">
      <Paragraph>
        Please provide the name of a GitHub repository that contains milestones
        that have issues linked to them.
      </Paragraph>
      <div>
        <TextInput
          placeholder="owner/repo"
          invalidMessage={
            isInvalid &&
            "The format of the input is invalid. It should be in the form of 'owner/repo'."
          }
          onChange={setInput}
          button={<Button onClick={onClick}>Add</Button>}
        />
      </div>
    </Content>
  );
}

export default AddRepo;
