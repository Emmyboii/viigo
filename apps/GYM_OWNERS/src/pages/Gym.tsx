import { useState } from "react";
import EditGym from "../components/EditGym";
import GymDetails from "../components/GymDetails";

export default function Gym() {

    const [display, setDisplay] = useState<"details" | "edit">("details");

    return (
        <div className="min-h-screen">
            {display === "details" ? (
                <GymDetails setDisplay={setDisplay} />
            ) : (
                <EditGym setDisplay={setDisplay} />
            )}
        </div>
    )
}