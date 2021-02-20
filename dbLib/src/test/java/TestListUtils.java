import io.github.markusjx.util.ListUtils;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Random;
import java.util.stream.Collectors;

public class TestListUtils {
    private static final Random rand = new Random();
    private static final int MAX_ARR_LEN = 1000000;

    private static List<Integer> getRandomInts() {
        final int numInts = rand.nextInt(MAX_ARR_LEN);
        List<Integer> ints = new ArrayList<>(numInts);
        for (int i = 0; i < numInts; i++) {
            ints.add(rand.nextInt(MAX_ARR_LEN));
        }

        return ints;
    }

    private static List<Integer> getFixedIntegerList(int listSize) {
        List<Integer> ints = new ArrayList<>(listSize);
        for (int i = 0; i < listSize; i++) {
            ints.add(rand.nextInt(listSize));
        }

        return ints;
    }

    @Test
    void removeAllTest() {
        final Logger logger = LoggerFactory.getLogger("removeAllTest");
        final int NUM_RUNS = 50;
        long sizes = 0;
        long time = 0;

        for (int i = 0; i < NUM_RUNS; i++) {
            List<Integer> ints = getRandomInts();
            sizes += ints.size();

            long cur_time = System.currentTimeMillis();
            List<Integer> res = ListUtils.removeAll(ints, ints, false);
            time += System.currentTimeMillis() - cur_time;

            Assertions.assertEquals(0, res.size());
            logger.info("Run " + (i + 1) + "/" + NUM_RUNS + " finished");
        }

        logger.info("Average list size: " + (sizes / NUM_RUNS));
        logger.info("Average run time: " + (time / NUM_RUNS) + "ms");
    }

    @Test
    void randomRemoveTest() {
        final Logger logger = LoggerFactory.getLogger("randomRemoveTest");
        final int NUM_RUNS = 10;
        final int NUM_INTEGERS = 100000;
        long listUtils_time = 0;
        long java_time = 0;

        logger.info("Running with fixed list size: " + NUM_INTEGERS);

        for (int i = 0; i < NUM_RUNS; i++) {
            List<Integer> ints = getFixedIntegerList(NUM_INTEGERS);
            List<Integer> toRemove = getFixedIntegerList(NUM_INTEGERS / 2);

            long cur_time = System.currentTimeMillis();
            List<Integer> res = ListUtils.removeAll(ints, toRemove, false);
            listUtils_time += System.currentTimeMillis() - cur_time;
            logger.info("Run " + (i + 0.5) + "/" + NUM_RUNS + " finished");

            cur_time = System.currentTimeMillis();
            ints.removeAll(toRemove);
            java_time += System.currentTimeMillis() - cur_time;
            logger.info("Run " + (i + 1) + "/" + NUM_RUNS + " finished");

            Collections.sort(ints);
            Assertions.assertEquals(ints, res, toRemove.toString());
        }

        logger.info("Custom implementation average run time: " + (listUtils_time / NUM_RUNS) + "ms");
        logger.info("Java implementation average run time: " + (java_time / NUM_RUNS) + "ms");
    }

    @Test
    void distinctTest() {
        final Logger logger = LoggerFactory.getLogger("distinctTest");
        final int NUM_RUNS = 10;
        final int NUM_INTEGERS = 100000;
        long listUtils_time = 0;
        long java_time = 0;

        logger.info("Running with fixed list size: " + NUM_INTEGERS);

        for (int i = 0; i < NUM_RUNS; i++) {
            List<Integer> ints = getFixedIntegerList(NUM_INTEGERS);
            List<Integer> toRemove = getFixedIntegerList(NUM_INTEGERS / 2);

            long cur_time = System.currentTimeMillis();
            List<Integer> res = ListUtils.removeAll(ints, toRemove, true);
            listUtils_time += System.currentTimeMillis() - cur_time;
            logger.info("Run " + (i + 0.5) + "/" + NUM_RUNS + " finished");

            cur_time = System.currentTimeMillis();
            ints.removeAll(toRemove);
            ints = ints.stream().distinct().sorted().collect(Collectors.toList());
            java_time += System.currentTimeMillis() - cur_time;
            logger.info("Run " + (i + 1) + "/" + NUM_RUNS + " finished");

            Assertions.assertEquals(ints, res, toRemove.toString());
        }

        logger.info("Custom implementation average run time: " + (listUtils_time / NUM_RUNS) + "ms");
        logger.info("Java implementation average run time: " + (java_time / NUM_RUNS) + "ms");
    }
}
