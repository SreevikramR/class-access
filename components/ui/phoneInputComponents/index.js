import { Button } from "@/components/ui/button";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import parsePhoneNumberFromString, {
    AsYouType,
} from "libphonenumber-js";
import { Check, ChevronsUpDown } from "lucide-react";
import * as React from "react";
import { countries } from "./countries";
import { useStateHistory } from "./use-state-history";

export function getPhoneData(phone) {
    const asYouType = new AsYouType();
    asYouType.input(phone);
    const number = asYouType.getNumber();
    return {
        phoneNumber: number?.number,
        countryCode: number?.country,
        countryCallingCode: number?.countryCallingCode,
        carrierCode: number?.carrierCode,
        nationalNumber: number?.nationalNumber,
        internationalNumber: number?.formatInternational(),
        possibleCountries: number?.getPossibleCountries().join(", "),
        isValid: number?.isValid(),
        isPossible: number?.isPossible(),
        uri: number?.getURI(),
        type: number?.getType(),
    };
}

export function PhoneInput({
    value: valueProp,
    defaultCountry = "IN",
    className,
    id,
    required = true,
    ...rest
}) {
    const asYouType = new AsYouType();

    const inputRef = React.useRef(null);

    const [value, handlers, history] = useStateHistory(valueProp);

    if (value && value.length > 0) {
        defaultCountry =
            parsePhoneNumberFromString(value)?.getPossibleCountries()[0] ||
            defaultCountry;
    }

    const [openCommand, setOpenCommand] = React.useState(false);
    const [countryCode, setCountryCode] =
        React.useState (defaultCountry);

    const selectedCountry = countries.find(
        (country) => country.iso2 === countryCode,
    );

    const initializeDefaultValue = () => {
        if (value) {
            return value;
        }

        return `+${selectedCountry?.phone_code}`;
    };

    const handleOnInput = (event) => {
        asYouType.reset();

        let value = event.currentTarget.value;
        if (!value.startsWith("+")) {
            value = `+${value}`;
        }

        const formattedValue = asYouType.input(value);
        const number = asYouType.getNumber();
        setCountryCode(number?.country || defaultCountry);
        event.currentTarget.value = formattedValue;
        handlers.set(formattedValue);
    };

    const handleOnPaste = (event) => {
        event.preventDefault();
        asYouType.reset();

        const clipboardData = event.clipboardData;

        if (clipboardData) {
            const pastedData = clipboardData.getData("text/plain");
            const formattedValue = asYouType.input(pastedData);
            const number = asYouType.getNumber();
            setCountryCode(number?.country || defaultCountry);
            event.currentTarget.value = formattedValue;
            handlers.set(formattedValue);
        }
    };

    const handleKeyDown = (event) => {
        if ((event.metaKey || event.ctrlKey) && event.key === "z") {
            handlers.back();
            if (
                inputRef.current &&
                history.current > 0 &&
                history.history[history.current - 1] !== undefined
            ) {
                event.preventDefault();
                inputRef.current.value = history.history[history.current - 1] || "";
            }
        }
    };

    return (
        <div className={cn("flex gap-2", className)}>
            <Popover open={openCommand} onOpenChange={setOpenCommand} modal={true}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={openCommand}
                        className="w-max items-center justify-between whitespace-nowrap"
                    >
                        {selectedCountry?.name ? (
                            <span className="relative top-0.5">{selectedCountry.emoji}</span>
                        ) : (
                            "Select country"
                        )}
                        <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="p-0 w-max" align="start">
                    <Command>
                        <CommandInput placeholder="Search country..." />
                        <CommandList>
                            <CommandEmpty>No country found.</CommandEmpty>
                            <ScrollArea
                                className={
                                    "[&>[data-radix-scroll-area-viewport]]:max-h-[300px]"
                                }
                            >
                                <CommandGroup>
                                    {countries.map((country) => {
                                        return (
                                            <CommandItem
                                                key={country.iso3}
                                                value={`${country.name} (+${country.phone_code})`}
                                                onSelect={() => {
                                                    if (inputRef.current) {
                                                        inputRef.current.value = `+${country.phone_code}`;
                                                        handlers.set(`+${country.phone_code}`);
                                                        inputRef.current.focus();
                                                    }
                                                    setCountryCode(country.iso2);
                                                    setOpenCommand(false);
                                                }}
                                            >
                                                <Check
                                                    className={cn(
                                                        "mr-2 size-4",
                                                        countryCode === country.iso2
                                                            ? "opacity-100"
                                                            : "opacity-0",
                                                    )}
                                                />
                                                <img
                                                    src={`/flags/${country.iso2.toLowerCase()}.svg`}
                                                    className="relative top-0.5 mr-2 w-4 h-3 object-cover"
                                                    aria-labelledby={country.name}
                                                    title={country.name}
                                                    alt={country.name}
                                                />
                                                {country.name}
                                                <span className="text-gray-11 ml-1">
                                                    (+{country.phone_code})
                                                </span>
                                            </CommandItem>
                                        );
                                    })}
                                </CommandGroup>
                            </ScrollArea>
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>
            <Input
                ref={inputRef}
                type="text"
                pattern="^(\+)?[0-9\s]*$"
                name="phone"
                id={id}
                placeholder="Phone"
                defaultValue={initializeDefaultValue()}
                onInput={handleOnInput}
                onPaste={handleOnPaste}
                onKeyDown={handleKeyDown}
                required={required}
                aria-required={required}
                {...rest}
            />
        </div>
    );
}