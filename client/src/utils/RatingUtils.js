import { 
  collection, 
  query, 
  where, 
  getDocs, 
  doc, 
  getDoc, 
  setDoc,
  writeBatch
} from 'firebase/firestore';
import { db } from '../../firebaseconfi';

// Create a ratings cache to avoid repeated Firestore queries
const ratingsCache = new Map();
const CACHE_EXPIRY = 30 * 60 * 1000; // 30 minutes (increased from 5 minutes)
let pendingRatingUpdates = {};
let batchUpdateTimeout = null;

/**
 * Fetches the most recent average rating and review count for a restaurant
 * @param {string} restaurantId - The ID of the restaurant
 * @param {boolean} forceRefresh - Whether to force a refresh from the database
 * @returns {Object} Object containing { averageRating, reviewsCount }
 */
export const fetchRestaurantRating = async (restaurantId, forceRefresh = false) => {
  try {
    // Check cache first if not forcing refresh
    if (!forceRefresh && ratingsCache.has(restaurantId)) {
      const cachedData = ratingsCache.get(restaurantId);
      if (Date.now() - cachedData.timestamp < CACHE_EXPIRY) {
        return cachedData.data;
      }
    }
    
    // First check if the restaurant has a stored rating in its document
    const restaurantRef = doc(db, "restaurants", restaurantId);
    const restaurantDoc = await getDoc(restaurantRef);
    
    // If restaurant has a rating and we're not forcing refresh, use that
    if (restaurantDoc.exists() && restaurantDoc.data().rating && !forceRefresh) {
      const rating = restaurantDoc.data().rating;
      const reviewsCount = restaurantDoc.data().reviewsCount || 0;
      
      const result = {
        averageRating: rating,
        reviewsCount: reviewsCount
      };
      
      // Cache the result
      ratingsCache.set(restaurantId, {
        data: result,
        timestamp: Date.now()
      });
      
      return result;
    }
    
    // Get all reviews to count them
    const reviewsQuery = query(
      collection(db, "reviews"),
      where("restaurantId", "==", restaurantId)
    );
    
    const reviewsSnapshot = await getDocs(reviewsQuery);
    const reviewsCount = reviewsSnapshot.size;
    
    // If there are no reviews, use default value or stored value
    if (reviewsCount === 0) {
      const defaultRating = restaurantDoc.exists() && restaurantDoc.data().rating 
        ? restaurantDoc.data().rating 
        : 5.0;
      
      const result = {
        averageRating: defaultRating,
        reviewsCount: 0
      };
      
      // Cache the result
      ratingsCache.set(restaurantId, {
        data: result,
        timestamp: Date.now()
      });
      
      return result;
    }
    
    // Calculate average rating from reviews
    let totalRating = 0;
    reviewsSnapshot.forEach(doc => {
      const review = doc.data();
      totalRating += review.rating || 0;
    });
    
    const averageRating = parseFloat((totalRating / reviewsCount).toFixed(1));
    
    // Store result
    const result = {
      averageRating,
      reviewsCount
    };
    
    // Queue the update instead of updating immediately
    queueRatingUpdate(restaurantId, averageRating, reviewsCount);
    
    // Cache the result
    ratingsCache.set(restaurantId, {
      data: result,
      timestamp: Date.now()
    });
    
    // Return the data
    return result;
  } catch (error) {
    console.error('Error fetching restaurant rating:', error);
    return { averageRating: 5.0, reviewsCount: 0 };
  }
};

/**
 * Queue a rating update to be processed in a batch
 * @param {string} restaurantId - The ID of the restaurant
 * @param {number} rating - The new rating
 * @param {number} reviewsCount - The review count
 */
const queueRatingUpdate = (restaurantId, rating, reviewsCount) => {
  pendingRatingUpdates[restaurantId] = { rating, reviewsCount };
  
  // If a batch update is not already scheduled, schedule one
  if (!batchUpdateTimeout) {
    batchUpdateTimeout = setTimeout(processBatchUpdates, 2000); // Process after 2 seconds of inactivity
  }
};

/**
 * Process all pending rating updates in a single batch
 */
const processBatchUpdates = async () => {
  if (Object.keys(pendingRatingUpdates).length === 0) {
    batchUpdateTimeout = null;
    return;
  }
  
  try {
    const batch = writeBatch(db);
    
    // Add all pending updates to the batch
    for (const [restaurantId, data] of Object.entries(pendingRatingUpdates)) {
      const restaurantRef = doc(db, "restaurants", restaurantId);
      batch.set(restaurantRef, {
        rating: data.rating,
        reviewsCount: data.reviewsCount
      }, { merge: true });
    }
    
    // Commit the batch
    await batch.commit();
    
    // Clear pending updates
    pendingRatingUpdates = {};
  } catch (error) {
    console.error('Error processing batch updates:', error);
  }
  
  batchUpdateTimeout = null;
};

/**
 * Updates the average rating for a restaurant in Firestore
 * @param {string} restaurantId - The ID of the restaurant
 * @param {number} newRating - The new rating value (optional - if provided, will be used in calculation)
 * @returns {Promise<number>} The new average rating
 */
export const updateRestaurantRating = async (restaurantId, newRating = null) => {
  try {
    // Check cache first
    if (ratingsCache.has(restaurantId) && newRating === null) {
      const cachedData = ratingsCache.get(restaurantId);
      if (Date.now() - cachedData.timestamp < CACHE_EXPIRY) {
        return cachedData.data.averageRating;
      }
    }
    
    // Get all reviews for the restaurant
    const reviewsQuery = query(
      collection(db, "reviews"),
      where("restaurantId", "==", restaurantId)
    );
    
    const reviewsSnapshot = await getDocs(reviewsQuery);
    
    // Calculate new average based on all reviews in database
    let totalRating = 0;
    let totalReviews = reviewsSnapshot.size;
    
    // If we have a new rating and no reviews in database yet
    if (totalReviews === 0 && newRating !== null) {
      totalRating = newRating;
      totalReviews = 1;
    } else {
      // Sum up all ratings from database
      reviewsSnapshot.forEach(docSnapshot => {
        const review = docSnapshot.data();
        totalRating += review.rating || 0;
      });
    }
    
    // Calculate average and round to 1 decimal place
    const averageRating = parseFloat((totalRating / totalReviews).toFixed(1));
    
    // Queue the update instead of updating immediately
    queueRatingUpdate(restaurantId, averageRating, totalReviews);
    
    // Update cache
    ratingsCache.set(restaurantId, {
      data: { averageRating, reviewsCount: totalReviews },
      timestamp: Date.now()
    });
    
    return averageRating;
  } catch (error) {
    console.error('Error updating restaurant rating:', error);
    return 5.0; // Default rating
  }
};

/**
 * Formats a rating for display, always showing one decimal place
 * @param {number|string} rating - The rating to format
 * @returns {string} The formatted rating
 */
export const formatRating = (rating) => {
  if (!rating) return "5.0";
  
  // Convert to number if it's a string
  const numRating = typeof rating === 'string' ? parseFloat(rating) : rating;
  
  // Format to 1 decimal place, always showing the decimal
  return numRating.toFixed(1);
};

/**
 * Batch updates multiple restaurant objects with their latest ratings from cache or default values
 * @param {Array<Object>} restaurants - Array of restaurant objects to update
 * @returns {Promise<Array<Object>>} Array of updated restaurant objects
 */
export const batchUpdateRestaurantsWithRatings = async (restaurants) => {
  if (!restaurants || !Array.isArray(restaurants) || restaurants.length === 0) {
    return [];
  }
  
  // Create a deep copy of all restaurants to avoid mutating the originals
  const updatedRestaurants = JSON.parse(JSON.stringify(restaurants));
  
  // Update each restaurant's rating from cache or use default
  for (let i = 0; i < updatedRestaurants.length; i++) {
    const restaurant = updatedRestaurants[i];
    if (restaurant && restaurant.id) {
      // Use cached rating if available
      if (ratingsCache.has(restaurant.id)) {
        const cachedData = ratingsCache.get(restaurant.id);
        if (Date.now() - cachedData.timestamp < CACHE_EXPIRY) {
          if (restaurant.details) {
            restaurant.details.rating = cachedData.data.averageRating;
          }
          continue;
        }
      }
      
      // If no cache or expired, use default or existing rating
      if (restaurant.details && !restaurant.details.rating) {
        restaurant.details.rating = 5.0;
      }
    }
  }
  
  // Queue a background refresh of all ratings without waiting for it
  setTimeout(() => {
    refreshRatingsInBackground(restaurants);
  }, 100);
  
  return updatedRestaurants;
};

/**
 * Refresh ratings in the background without blocking the UI
 * @param {Array<Object>} restaurants - Array of restaurant objects
 */
const refreshRatingsInBackground = async (restaurants) => {
  try {
    for (const restaurant of restaurants) {
      if (restaurant && restaurant.id) {
        // Skip if we have a recent cache
        if (ratingsCache.has(restaurant.id)) {
          const cachedData = ratingsCache.get(restaurant.id);
          if (Date.now() - cachedData.timestamp < CACHE_EXPIRY) {
            continue;
          }
        }
        
        // Fetch rating with low priority
        await fetchRestaurantRating(restaurant.id);
      }
    }
  } catch (error) {
    console.error('Background rating refresh error:', error);
  }
};

/**
 * Updates a restaurant object with the latest rating from cache or Firestore
 * @param {Object} restaurant - The restaurant object to update
 * @returns {Promise<Object>} The updated restaurant object
 */
export const updateRestaurantWithLiveRating = async (restaurant) => {
  if (!restaurant || !restaurant.id) {
    return restaurant;
  }
  
  try {
    // Check cache first
    if (ratingsCache.has(restaurant.id)) {
      const cachedData = ratingsCache.get(restaurant.id);
      if (Date.now() - cachedData.timestamp < CACHE_EXPIRY) {
        // Create a deep copy to avoid mutating the original
        const updatedRestaurant = JSON.parse(JSON.stringify(restaurant));
        
        // Update the rating in the details object
        if (updatedRestaurant.details) {
          updatedRestaurant.details.rating = cachedData.data.averageRating;
        }
        
        return updatedRestaurant;
      }
    }
    
    // If not in cache or expired, fetch from Firestore
    const { averageRating } = await fetchRestaurantRating(restaurant.id);
    
    // Create a deep copy to avoid mutating the original
    const updatedRestaurant = JSON.parse(JSON.stringify(restaurant));
    
    // Update the rating in the details object
    if (updatedRestaurant.details) {
      updatedRestaurant.details.rating = averageRating;
    }
    
    return updatedRestaurant;
  } catch (error) {
    console.error('Error updating restaurant with live rating:', error);
    return restaurant;
  }
}; 