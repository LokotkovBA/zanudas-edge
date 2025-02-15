import { useEffect, useRef, useState } from "react";
import { getIsCurrentWeek, getUTCWeekDay } from "~/utils/schedule";

export function useDynamicTime(
    weekStartTimestamp: number,
    weekEndTimestamp: number,
) {
    const todayRef = useRef(new Date());
    const [currentHour, setCurrentHour] = useState(
        todayRef.current.getUTCHours(),
    );
    const [isCurrentWeek, setIsCurrentWeek] = useState(
        getIsCurrentWeek(
            todayRef.current.getTime(),
            weekStartTimestamp,
            weekEndTimestamp,
        ),
    );
    const [currentWeekDay, setCurrentWeekDay] = useState(
        getUTCWeekDay(todayRef.current),
    );

    const hourSyncTimer = useRef<ReturnType<typeof setTimeout>>();
    const hourSyncInterval = useRef<ReturnType<typeof setInterval>>();

    useEffect(() => {
        setCurrentHour(todayRef.current.getHours());
        setIsCurrentWeek(
            getIsCurrentWeek(
                todayRef.current.getTime(),
                weekStartTimestamp,
                weekEndTimestamp,
            ),
        );
        const firstWait =
            (60 - todayRef.current.getMinutes()) * 60000 -
            todayRef.current.getSeconds() * 1000;

        function syncTime() {
            const newTime = new Date();
            setCurrentHour(newTime.getHours());
            setIsCurrentWeek(
                getIsCurrentWeek(
                    newTime.getTime(),
                    weekStartTimestamp,
                    weekEndTimestamp,
                ),
            );
            setCurrentWeekDay(getUTCWeekDay(newTime));
        }

        hourSyncTimer.current = setTimeout(() => {
            syncTime();
            hourSyncInterval.current = setInterval(syncTime, 3600000);
        }, firstWait);

        return () => {
            clearTimeout(hourSyncTimer.current);
            clearInterval(hourSyncInterval.current);
        };
    }, [weekStartTimestamp, weekEndTimestamp]);

    return [currentHour, currentWeekDay, isCurrentWeek] as const;
}
