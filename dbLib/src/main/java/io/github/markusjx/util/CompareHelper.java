package io.github.markusjx.util;

public final class CompareHelper {
    /**
     * Don't.
     */
    private CompareHelper() {
    }

    /**
     * Compare a value with another value.
     * Both values may be null.
     *
     * @param value the first value
     * @param other the value to compare to
     * @param <T>   the type of the values
     * @return a compareTo result
     */
    public static <T extends Comparable<? super T>> int compareTo(T value, T other) {
        if (value == null || other == null) {
            if (value == null && other != null) {
                return -1;
            } else if (value != null) {
                return 1;
            } else {
                return 0;
            }
        } else {
            return value.compareTo(other);
        }
    }
}
