export function createCorrelationId() {
    return ("c-" +
        Math.random()
            .toString(36)
            .substr(2, 16));
}
