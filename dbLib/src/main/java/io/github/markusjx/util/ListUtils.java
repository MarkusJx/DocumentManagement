package io.github.markusjx.util;

import java.util.Arrays;
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
     * Get the first occurrence of an element in an Array using binary search.
     * Uses {@link Arrays#binarySearch(Object[], Object)} to find the value.
     * Requires a sorted input array as input.
     * <br>
     * Complexity: O(n + log(n)) = O(n) or O(m + log(n)) with m being the
     * number of occurrences of the element to find in the array.
     *
     * @param in     the input array
     * @param toFind the value to find
     * @param <T>    the type of the array and element to find
     * @return the index of the first occurrence of {@code toFind}
     * or -1 if the value could not be found
     */
    public static <T extends Comparable<T>> int binarySearchFirst(T[] in, T toFind) {
        // Use Arrays.binarySearch to find an occurrence of toFind
        int searchResult = Arrays.binarySearch(in, toFind);

        // Check if the value was found. If not, return -1.
        if (searchResult < 0 || in[searchResult].compareTo(toFind) != 0) {
            return -1;
        }

        // If there is an occurrence of toFind prior to in[searchResult],
        // iterate over the input array to find the first occurrence of toFind
        if (searchResult > 0 && in[searchResult - 1].compareTo(toFind) == 0) {
            // We know in[searchResult - 1] equals toFind -> Decrease searchResult
            searchResult--;

            // Search for more occurrences of toFind even more prior to in[searchResult]
            while (searchResult > 0 && in[searchResult - 1].compareTo(toFind) == 0) {
                searchResult--;
            }
        }

        // Return the result. Duh.
        return searchResult;
    }

    /**
     * Remove a list of objects from another list of objects.
     * Equals in functionality to {@link List#removeAll(Collection)} but is faster.
     * Uses sorted arrays to remove the values from {@code in}. Will sort
     * the {@code toRemove} list but won't alter the {@code in} {@link List}.
     * <br><br>
     * Requires O(3n) additional memory.<br>
     * Complexity: O(5n + 2n*log(n)) = O(n*log(n))
     *
     * @param in       the {@link List<T>} to remove the objects from
     * @param toRemove the {@link List<T>} of objects to remove. Will be sorted.
     * @param <T>      the type of the arrays
     * @return a new {@link java.util.ArrayList<T>} wil all objects except those from toRemove
     */
    public static <T extends Comparable<T>> List<T> removeAll(final List<T> in, final List<T> toRemove) {
        // If toRemove is empty, there's nothing to remove
        if (toRemove.isEmpty()) return in;

        // Copy all contents of in to a new Comparable<?> array
        @SuppressWarnings("unchecked")
        T[] inArr = (T[]) in.toArray(new Comparable<?>[0]);

        // Sort both input arrays
        Arrays.sort(inArr);
        Collections.sort(toRemove);

        // Search for the first occurrence of toRemove[0].
        // This will be our first object to remove.
        int n1 = binarySearchFirst(inArr, toRemove.get(0));

        // Arrays.binarySearch returns the index where the element
        // would be inserted if not found;
        // Check if toRemove[0] equals inArr[n1]. If not,
        // there's nothing to remove, return.
        if (n1 < 0 || inArr[n1].compareTo(toRemove.get(0)) != 0) return in;

        // This will be the index of the last element to be removed.
        // The index of the second value to remove is at least n + 1.
        int n2 = n1 + 1;

        // This will be the search index in toRemove. Start at
        // toRemove[1] as toRemove[0] should be equal to inArr[n1].
        int i = 1;

        // Increase n2 as long as both arrays have common values.
        // The last position to remove is either the last common
        // value of inArr with toRemove or inArr.length.
        while ((inArr[n2].compareTo(toRemove.get(i)) == 0 || inArr[n2].compareTo(toRemove.get(i + 1)) == 0) && (n2 + 1) < inArr.length) {
            if (inArr[n2].compareTo(toRemove.get(i)) != 0) i++;
            n2++;
        }

        // The number of elements in the output array is the
        // index of the first element to remove plus the
        // input array length minus the position of the last
        // element to remove (=number of elements to remove) minus one.
        final int numElements = n1 + (inArr.length - n2 - 1);

        // Create the output array as a new Comparable<?> array.
        @SuppressWarnings("unchecked")
        T[] outArr = (T[]) new Comparable<?>[numElements];

        // Copy all elements except the elements to remove to outArr
        System.arraycopy(inArr, 0, outArr, 0, n1);
        System.arraycopy(inArr, n2, outArr, n1, numElements - n1);

        // Convert the array to an ArrayList
        return Arrays.asList(outArr);
    }
}
