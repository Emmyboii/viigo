import { HiLocationMarker } from "react-icons/hi"
import { IoIosArrowDown } from "react-icons/io";
import { IoNotificationsOutline } from "react-icons/io5";

const UserHome = () => {
    return (
        <div className="overflow-x-hidden py-5 px-4">
            <div className="flex justify-between">
                <div className="flex items-center gap-2">
                    <HiLocationMarker className="text-[#475569] size-6" />
                    <div>
                        <p>Pallavaram</p>
                        <p>Chennai</p>
                    </div>
                    <IoIosArrowDown className="text-[#475569] size-6" />
                </div>

                <div>
                    <IoNotificationsOutline className="text-[#475569] size-6" />
                </div>
            </div>
        </div>
    )
}

export default UserHome