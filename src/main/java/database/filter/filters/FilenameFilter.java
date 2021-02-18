package database.filter.filters;

import database.databaseTypes.Document;
import database.filter.DocumentFilterBase;
import database.filter.DocumentFilterOperations;

import javax.persistence.criteria.CriteriaBuilder;
import javax.persistence.criteria.Predicate;
import javax.persistence.criteria.Root;
import java.util.Arrays;

/**
 * A filter for filtering documents by their name
 */
public class FilenameFilter implements DocumentFilterBase {
    /**
     * The file name to search
     */
    private final String filename;

    /**
     * Whether the document name must
     * match this.filename exactly
     */
    private final boolean exactMatch;

    /**
     * Create a new FilenameFilter instance
     *
     * @param filename   the name of the file to search for
     * @param exactMatch whether the filename argument should be an exact match
     */
    public FilenameFilter(String filename, boolean exactMatch) {
        this.filename = filename;
        this.exactMatch = exactMatch;
    }

    /**
     * Get the filter operations
     *
     * @param cb   the criteria builder object
     * @param root the root object
     * @return the filter operations
     */
    @Override
    public DocumentFilterOperations getFilter(CriteriaBuilder cb, Root<Document> root) {
        return new DocumentFilterOperations() {
            @Override
            public Predicate where() {
                if (exactMatch) {
                    return cb.equal(root.get("filename"), filename);
                } else {
                    // If the filename should be like this.filename,
                    // search the filename by %FILENAME%
                    return cb.like(root.get("filename"), '%' + filename + '%');
                }
            }
        };
    }

    /**
     * Get the match accuracy of this filter.
     * If this.exactMatch is true, this function returns 0.
     * Otherwise the levenshtein editing distance is returned.
     *
     * @param document the document object to match
     * @return the match accuracy
     */
    @Override
    public int getAccuracy(Document document) {
        // If this is an exact match, the accuracy is 0
        if (exactMatch) return 0;

        if (document.filename == null) {
            // If the document's filename is null, the
            // Levenshtein distance is equal to the length of this.filename
            return this.filename.length();
        } else {
            // Return the Levenshtein editing distance
            return LevenshteinDistance.calculate(document.filename, this.filename);
        }
    }

    /**
     * A class for calculating the levenshtein
     * editing distance of two strings
     * <p>
     * Source: https://www.baeldung.com/java-levenshtein-distance
     */
    private static abstract class LevenshteinDistance {
        /**
         * Calculate the Levenshtein editing distance
         *
         * @param x the fist string to check
         * @param y the second string to check
         * @return the levenshtein editing distance
         */
        private static int calculate(String x, String y) {
            int[][] dp = new int[x.length() + 1][y.length() + 1];

            for (int i = 0; i <= x.length(); i++) {
                for (int j = 0; j <= y.length(); j++) {
                    if (i == 0) {
                        dp[i][j] = j;
                    } else if (j == 0) {
                        dp[i][j] = i;
                    } else {
                        dp[i][j] = min(dp[i - 1][j - 1] + costOfSubstitution(x.charAt(i - 1), y.charAt(j - 1)),
                                dp[i - 1][j] + 1,
                                dp[i][j - 1] + 1);
                    }
                }
            }

            return dp[x.length()][y.length()];
        }

        private static int costOfSubstitution(char a, char b) {
            return a == b ? 0 : 1;
        }

        private static int min(int... numbers) {
            return Arrays.stream(numbers)
                    .min().orElse(Integer.MAX_VALUE);
        }
    }

}
