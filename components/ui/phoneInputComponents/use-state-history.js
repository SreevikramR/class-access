import { useCallback, useMemo, useState } from "react";

export function useStateHistory(
    initialValue,
) {
    const [state, setState] = useState({
        history: [initialValue],
        current: 0,
    });

    const set = useCallback(
        (val) =>
            setState((currentState) => {
                const nextState = [
                    ...currentState.history.slice(0, currentState.current + 1),
                    val,
                ];
                return {
                    history: nextState,
                    current: nextState.length - 1,
                };
            }),
        [],
    );

    const back = useCallback(
        (steps = 1) =>
            setState((currentState) => ({
                history: currentState.history,
                current: Math.max(0, currentState.current - steps),
            })),
        [],
    );

    const forward = useCallback(
        (steps = 1) =>
            setState((currentState) => ({
                history: currentState.history,
                current: Math.min(
                    currentState.history.length - 1,
                    currentState.current + steps,
                ),
            })),
        [],
    );

    const handlers = useMemo(
        () => ({ set, forward, back }),
        [set, forward, back],
    );

    return [state.history[state.current], handlers, state];
}
