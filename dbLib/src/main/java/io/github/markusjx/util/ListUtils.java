package io.github.markusjx.util;

import java.util.ArrayList;
import java.util.Collection;
import java.util.Collections;
import java.util.List;

/**
 * A class for List operations
 */
public final class ListUtils {
    /**
     * Don't.
     */
    private ListUtils() {
    }

    /**
     * Sort a list and remove all multiple occurrences.<br>
     * Complexity: {@code O(n + n*log(n)) = O(n*log(n))}<br>
     * Requires {@code O(2n)} additional memory
     *
     * @param in  the input list
     * @param <T> the type of the input list
     * @return a sorted list with only distinct values
     */
    public static <T extends Comparable<T>> List<T> distinctSorted(final List<T> in) {
        // Make a copy of the original list
        List<T> cpy = new ArrayList<>(in);

        // Sort it
        Collections.sort(cpy);

        // Create the result list
        List<T> res = new ArrayList<>(cpy.size());

        // Iterate over the list and add only
        // distinct values to the result list
        for (int i = 0; i < cpy.size(); i++) {
            T val = cpy.get(i);
            res.add(val);

            // While val equals cpy[i + 1], increase i by one
            while ((i + 1) < cpy.size() && val.compareTo(cpy.get(i + 1)) == 0) {
                i++;
            }
        }

        return res;
    }

    /**
     * Remove a list of objects from another list of objects.
     * Equals in functionality to {@link List#removeAll(Collection)} but is faster.
     * Uses sorted arrays to remove the values from {@code in}.
     * Won't alter any of the input lists.
     * <br><br>
     * Requires {@code O(3n)} additional memory.<br>
     * Complexity: {@code O(4n + 2n*log(n) + n^2) = O(n*log(n))}
     *
     * @param in       the {@link List<T>} to remove the objects from
     * @param toRemove the {@link List<T>} of objects to remove
     * @param distinct whether to only return distinct values
     * @param <T>      the type of the arrays
     * @return a new {@link java.util.ArrayList<T>} wil all objects except those from toRemove
     */
    public static <T extends Comparable<T>> List<T> removeAll(List<T> in, List<T> toRemove, boolean distinct) {
        // If toRemove is empty, there's nothing to remove
        if (toRemove.isEmpty()) return in;

        // Copy toRemove
        toRemove = new ArrayList<>(toRemove);

        // Sort the toRemove list
        Collections.sort(toRemove);

        // Do the same for the input list
        if (distinct) {
            in = distinctSorted(in);
        } else {
            in = new ArrayList<>(in);
            Collections.sort(in);
        }

        // The current position in the toRemove array
        int i = 0;

        // The result array. Will just assume the output size
        // will be approximately half the size of the input list
        List<T> res = new ArrayList<>(in.size() / 2);

        // Iterate over the input array, filtering out every element in
        // toRemove. Although it doesn't look like it, this loop-thingy
        // has a complexity of O(n + m) = O(2n) with n being the size of the input
        // list and m being the size of the toRemove list; In the worst-case
        // scenario both lists are the same size.
        for (T el : in) {
            // Increase i as long as toRemove[i] is smaller than el and
            // i is smaller than toRemove.size.
            // This loop in total only runs toRemove.size times.
            while (i < toRemove.size() && el.compareTo(toRemove.get(i)) > 0) {
                i++;
            }

            // Add el to the output list if i is bigger than toRemove.size
            // or toRemove[0] does not equal el
            if (i >= toRemove.size() || el.compareTo(toRemove.get(i)) != 0) {
                res.add(el);
            }
        }

        // Return the result list
        return res;
    }
}
