import { PhoneInput, getPhoneData } from "./phoneInputComponents";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import * as React from "react";

export function PhoneInputComponent() {
    const [phone, setPhone] = React.useState("+1 (408) 996–1010");

    const handleOnChange = (e) => {
        setPhone(e.target.value);
    };

    const phoneData = getPhoneData(phone);

    return (
        <div className="w-full space-y-8">
            <div className="flex flex-col gap-4">
                <PhoneInput value={phone} onChange={handleOnChange} />
            </div>
            <div className="flex flex-col gap-2 border rounded-lg p-3 text-sm">
                <div className="flex gap-2">
                    <p>Phone number: </p>
                    <span className="font-semibold">{phoneData.phoneNumber || "-"}</span>
                </div>
                <Separator />
                <div className="flex gap-2">
                    <p>Country code: </p>
                    <span className="font-semibold">{phoneData.countryCode || "-"}</span>
                </div>
                <Separator />
                <div className="flex gap-2">
                    <p>Country calling code: </p>
                    <span className="font-semibold">
                        {phoneData.countryCallingCode || "-"}
                    </span>
                </div>
                <Separator />
                <div className="flex gap-2">
                    <p>National number: </p>
                    <span className="font-semibold">
                        {phoneData.nationalNumber || "-"}
                    </span>
                </div>
                <Separator />
                <div className="flex gap-2">
                    <p>International number: </p>
                    <span className="font-semibold">
                        {phoneData.internationalNumber || "-"}
                    </span>
                </div>
                <Separator />
                <div className="flex gap-2">
                    <p>URI: </p>
                    <span className="font-semibold">{phoneData.uri || "-"}</span>
                </div>
                <Separator />
                <div className="flex gap-2">
                    <p className="flex-shrink-0">Possible countries: </p>
                    <span className="font-semibold">
                        {phoneData.possibleCountries || "-"}
                    </span>
                </div>
            </div>
        </div>
    );
}