"use client";

import { UserButton } from "@civic/auth-web3/react";

const ConnectButton: React.FC = () => {
  return (
    <div className="flex justify-center items-center">
      <UserButton />
    </div>
  );
};

export default ConnectButton;
