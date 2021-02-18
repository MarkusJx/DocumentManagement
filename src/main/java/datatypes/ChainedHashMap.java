package datatypes;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;

/**
 * A chained hash map. Basically a {@code HashMap<K, List<V>>}
 *
 * @param <K> the map key type
 * @param <V> the map list value type
 */
public class ChainedHashMap<K, V> extends HashMap<K, List<V>> {
    /**
     * Create a new chained hash map
     */
    public ChainedHashMap() {
        super();
    }

    /**
     * Put a value in the hash map.
     * If a key already exists, the value will be appended to the value list
     *
     * @param key   the key to add
     * @param value the value to add
     */
    public void putValue(K key, V value) {
        if (super.containsKey(key)) {
            super.get(key).add(value);
        } else {
            List<V> list = new ArrayList<>();
            list.add(value);
            super.put(key, list);
        }
    }
}
