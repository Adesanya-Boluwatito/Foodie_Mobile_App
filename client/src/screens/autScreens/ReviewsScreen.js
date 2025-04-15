import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  StyleSheet, 
  TouchableOpacity, 
  ActivityIndicator,
  Image,
  TextInput,
  Platform,
  KeyboardAvoidingView,
  Alert
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { auth, db } from '../../../firebaseconfi';
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  serverTimestamp,
  doc,
  getDoc,
  setDoc
} from 'firebase/firestore';
import AntDesign from '@expo/vector-icons/AntDesign';
import Ionicons from '@expo/vector-icons/Ionicons';
import { moderateScale, horizontalScale, verticalScale } from '../../theme/Metrics';
import { updateRestaurantRating } from '../../utils/RatingUtils';

// Modern accent color matching app theme
const ACCENT_COLOR = '#FF4D4F';

const StarRating = ({ rating, size = 16, onRatingChange = null }) => {
  const renderStars = () => {
    const stars = [];
    const maxStars = 5;
    
    for (let i = 1; i <= maxStars; i++) {
      stars.push(
        <TouchableOpacity 
          key={i} 
          onPress={() => onRatingChange && onRatingChange(i)}
          disabled={!onRatingChange}
          style={{ padding: 2 }}
        >
          <AntDesign
            name={i <= rating ? "star" : "staro"}
            size={size}
            color={i <= rating ? "#FFD700" : "#BBBBBB"}
          />
        </TouchableOpacity>
      );
    }
    return stars;
  };

  return (
    <View style={{ flexDirection: 'row' }}>
      {renderStars()}
    </View>
  );
};

const ReviewItem = ({ review }) => {
  const { username, rating, comment, timestamp, userProfileImage } = review;
  
  // Format date
  const formatDate = (timestamp) => {
    if (!timestamp) return 'Recently';
    
    const date = timestamp.toDate();
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };
  
  return (
    <View style={styles.reviewItem}>
      <View style={styles.reviewHeader}>
        <View style={styles.userInfo}>
          <Image 
            source={userProfileImage ? { uri: userProfileImage } : require('../../../assets/icon.png')} 
            style={styles.userAvatar} 
          />
          <View>
            <Text style={styles.username}>{username || 'Anonymous User'}</Text>
            <View style={styles.ratingContainer}>
              <StarRating rating={rating} size={14} />
              <Text style={styles.ratingDate}>{formatDate(timestamp)}</Text>
            </View>
          </View>
        </View>
      </View>
      <Text style={styles.comment}>{comment}</Text>
    </View>
  );
};

const WriteReviewSection = ({ restaurantId, onReviewAdded }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const submitReview = async () => {
    if (rating === 0) {
      Alert.alert('Error', 'Please select a rating');
      return;
    }
    
    if (comment.trim() === '') {
      Alert.alert('Error', 'Please write a review comment');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const user = auth.currentUser;
      if (!user) {
        Alert.alert('Error', 'You must be logged in to write a review');
        setIsSubmitting(false);
        return;
      }
      
      // Get user profile data for username
      const userDoc = await getDoc(doc(db, "users", user.uid));
      const userData = userDoc.data();
      
      const reviewData = {
        restaurantId,
        userId: user.uid,
        username: userData?.firstname ? `${userData.firstname} ${userData.lastname || ''}`.trim() : user.email,
        userProfileImage: userData?.profilePicture || null,
        rating,
        comment,
        timestamp: serverTimestamp()
      };
      
      await addDoc(collection(db, "reviews"), reviewData);
      
      // Update restaurant average rating
      await updateRestaurantRating(restaurantId, rating);
      
      // Reset form
      setRating(0);
      setComment('');
      
      // Notify parent to refresh reviews
      if (onReviewAdded) {
        onReviewAdded();
      }
      
      Alert.alert('Success', 'Your review has been submitted');
    } catch (error) {
      console.error('Error submitting review:', error);
      Alert.alert('Error', 'Failed to submit your review. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <View style={styles.writeReviewContainer}>
      <Text style={styles.writeReviewTitle}>Write a Review</Text>
      
      <View style={styles.ratingSelector}>
        <Text style={styles.ratingLabel}>Your Rating:</Text>
        <StarRating rating={rating} size={24} onRatingChange={setRating} />
      </View>
      
      <TextInput
        style={styles.commentInput}
        placeholder="Share your experience with this restaurant..."
        multiline
        value={comment}
        onChangeText={setComment}
      />
      
      <TouchableOpacity 
        style={[
          styles.submitButton, 
          (rating === 0 || comment.trim() === '' || isSubmitting) ? styles.submitButtonDisabled : {}
        ]}
        onPress={submitReview}
        disabled={rating === 0 || comment.trim() === '' || isSubmitting}
      >
        {isSubmitting ? (
          <ActivityIndicator color="#fff" size="small" />
        ) : (
          <Text style={styles.submitButtonText}>Submit Review</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

export default function ReviewsScreen() {
  const [reviews, setReviews] = useState([]);
  const [restaurant, setRestaurant] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigation = useNavigation();
  const route = useRoute();
  
  const { restaurantId } = route.params || {};
  
  const fetchRestaurantDetails = async () => {
    try {
      const restaurantDoc = await getDoc(doc(db, "restaurants", restaurantId));
      if (restaurantDoc.exists()) {
        setRestaurant(restaurantDoc.data());
      }
    } catch (error) {
      console.error('Error fetching restaurant details:', error);
    }
  };
  
  const fetchReviews = async () => {
    setIsLoading(true);
    try {
      const reviewsQuery = query(
        collection(db, "reviews"),
        where("restaurantId", "==", restaurantId),
        orderBy("timestamp", "desc")
      );
      
      const reviewsSnapshot = await getDocs(reviewsQuery);
      const reviewsList = reviewsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setReviews(reviewsList);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    if (restaurantId) {
      fetchRestaurantDetails();
      fetchReviews();
    } else {
      navigation.goBack();
    }
  }, [restaurantId]);
  
  const handleReviewAdded = () => {
    fetchReviews();
  };
  
  const calculateAverageRating = () => {
    if (reviews.length === 0) return 0;
    
    const sum = reviews.reduce((total, review) => total + review.rating, 0);
    return (sum / reviews.length).toFixed(1);
  };
  
  return (
    <KeyboardAvoidingView 
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.headerBackButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#222" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Reviews</Text>
          <View style={{ width: 40 }} />
        </View>
        
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Restaurant Info */}
          {restaurant && (
            <View style={styles.restaurantInfo}>
              <Text style={styles.restaurantName}>{restaurant.name}</Text>
              <View style={styles.ratingOverview}>
                <View style={styles.ratingBadge}>
                  <AntDesign name="star" size={16} color="#FFD700" />
                  <Text style={styles.ratingText}>{calculateAverageRating()}</Text>
                </View>
                <Text style={styles.reviewCount}>
                  {reviews.length} {reviews.length === 1 ? 'Review' : 'Reviews'}
                </Text>
              </View>
            </View>
          )}
          
          {/* Reviews List */}
          <View style={styles.reviewsContainer}>
            <Text style={styles.sectionTitle}>Customer Reviews</Text>
            
            {isLoading ? (
              <ActivityIndicator size="large" color={ACCENT_COLOR} style={styles.loader} />
            ) : reviews.length > 0 ? (
              reviews.map(review => (
                <ReviewItem key={review.id} review={review} />
              ))
            ) : (
              <View style={styles.emptyReviews}>
                <Ionicons name="chatbubble-ellipses-outline" size={48} color="#CCCCCC" />
                <Text style={styles.emptyReviewsText}>No reviews yet</Text>
                <Text style={styles.emptyReviewsSubtext}>Be the first to share your experience!</Text>
              </View>
            )}
          </View>
          
          {/* Write Review Section */}
          <WriteReviewSection 
            restaurantId={restaurantId}
            onReviewAdded={handleReviewAdded}
          />
          
          {/* Bottom padding for keyboard */}
          <View style={{ height: 100 }} />
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FCFBF4',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 40 : 25,
    paddingHorizontal: 15,
    backgroundColor: '#FCFBF4',
    height: Platform.OS === 'ios' ? 90 : 75,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  headerBackButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F0F0F0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222',
  },
  restaurantInfo: {
    padding: 15,
    backgroundColor: 'white',
    borderRadius: 15,
    margin: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  restaurantName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 10,
  },
  ratingOverview: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFAEB',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 12,
    marginRight: 10,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#222',
    marginLeft: 4,
  },
  reviewCount: {
    fontSize: 14,
    color: '#666',
  },
  reviewsContainer: {
    padding: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 15,
  },
  loader: {
    marginTop: 30,
  },
  emptyReviews: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    backgroundColor: 'white',
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  emptyReviewsText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222',
    marginTop: 10,
  },
  emptyReviewsSubtext: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
    textAlign: 'center',
  },
  reviewItem: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
    backgroundColor: '#F0F0F0',
  },
  username: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#222',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  ratingDate: {
    fontSize: 12,
    color: '#888',
    marginLeft: 8,
  },
  comment: {
    fontSize: 14,
    color: '#444',
    lineHeight: 20,
  },
  writeReviewContainer: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 16,
    margin: 15,
    marginTop: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  writeReviewTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 15,
  },
  ratingSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  ratingLabel: {
    fontSize: 14,
    color: '#666',
    marginRight: 10,
  },
  commentInput: {
    backgroundColor: '#F9F9F9',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#EEEEEE',
    padding: 12,
    fontSize: 14,
    color: '#222',
    minHeight: 100,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: ACCENT_COLOR,
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    marginTop: 15,
  },
  submitButtonDisabled: {
    backgroundColor: '#CCCCCC',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 