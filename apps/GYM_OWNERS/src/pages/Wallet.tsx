import { useState } from "react";
import WalletDetails from "../components/WalletDetails";
import CreateWallet from "../components/CreateWallet";

export default function Wallet() {

    const [display, setDisplay] = useState<"details" | "create">("details");

    return (
        <div className="min-h-screen">
            {display === "details" ? (
                <WalletDetails />
                // <WalletDetails setDisplay={setDisplay} />
            ) : (
                <CreateWallet />
                // <CreateWallet setDisplay={setDisplay} />
            )}
        </div>
    )
}