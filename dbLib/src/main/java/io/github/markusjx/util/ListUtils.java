package io.github.markusjx.util;

import java.util.*;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.stream.Collectors;

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
     * Partition a list based on a maximum size
     * Source: https://stackoverflow.com/a/51837311
     *
     * @param inputList the input list
     * @param size      the maximum size of the output list
     * @param <T>       the type of the list
     * @return the list of lists
     */
    public static <T> Collection<List<T>> partition(List<T> inputList, int size) {
        final AtomicInteger counter = new AtomicInteger(0);
        return inputList.stream()
                .collect(Collectors.groupingBy(s -> counter.getAndIncrement() / size))
                .values();
    }

    /**
     * Sort a list and remove all multiple occurrences.<br>
     * Complexity: {@code O(n + n*log(n)) = O(n*log(n))}<br>
     * Requires {@code O(2n)} additional memory
     *
     * @param in        the input list
     * @param alterList whether to alter the original list (only sorts it, does not remove anything from it)
     * @param <T>       the type of the input list
     * @return a sorted list with only distinct values
     */
    public static <T extends Comparable<? super T>> List<T> distinctSorted(List<T> in, boolean alterList) {
        Objects.requireNonNull(in);

        if (!alterList) {
            // Make a copy of the original list
            in = new ArrayList<>(in);
        }

        // Sort it
        Collections.sort(in);

        // Create the result list
        List<T> res = new ArrayList<>((int) (in.size() * 0.75));

        // Iterate over the list and add only
        // distinct values to the result list
        for (int i = 0; i < in.size(); i++) {
            final T val = in.get(i);
            res.add(val);

            // While val equals cpy[i + 1], increase i by one
            while ((i + 1) < in.size() && val.compareTo(in.get(i + 1)) == 0) {
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
     * Complexity: {@code O(4n + 2n*log(n)) = O(n*log(n))}
     *
     * @param in         the {@link List<T>} to remove the objects from
     * @param toRemove   the {@link List<T>} of objects to remove
     * @param distinct   whether to only return distinct values
     * @param alterLists whether to alter the input lists (only sorts them, doesn't remove anything)
     * @param <T>        the type of the arrays
     * @return a new {@link java.util.ArrayList<T>} wil all objects except those from toRemove
     */
    public static <T extends Comparable<? super T>> List<T> removeAll(List<T> in, List<T> toRemove, boolean distinct, boolean alterLists) {
        Objects.requireNonNull(in);
        Objects.requireNonNull(toRemove);

        // If toRemove is empty, there's nothing to remove
        if (toRemove.isEmpty()) {
            if (distinct) in = distinctSorted(in, alterLists);
            return in;
        }

        if (!alterLists) {
            // Copy toRemove
            toRemove = new ArrayList<>(toRemove);
        }

        // Sort the toRemove list
        Collections.sort(toRemove);

        // Do the same for the input list
        if (distinct) {
            in = distinctSorted(in, alterLists);
        } else {
            if (!alterLists) {
                in = new ArrayList<>(in);
            }
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
        for (final T el : in) {
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
