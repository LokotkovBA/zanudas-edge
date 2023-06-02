import { useEffect, useState } from "react";
import { fromZanudasToLocalHour, generateHourArray } from "~/utils/schedule";

export function useSelectHours() {
    const [hourArray, setHourArray] = useState(generateHourArray(7, 13));

    useEffect(() => {
        setHourArray(generateHourArray(fromZanudasToLocalHour(10), 13));
    }, []);

    return hourArray;
}
