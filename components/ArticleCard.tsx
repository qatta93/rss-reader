import React from "react";
import { Pressable, View, StyleSheet } from "react-native";
import { Card, Title, Paragraph, IconButton } from "react-native-paper";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import { Article } from "@/constants/types";
import { Colors } from "@/constants/Colors";

export type ArticleCardVariant = "feed" | "favorite";

interface ArticleCardProps {
  article: Article;
  variant: ArticleCardVariant;
  isMobile?: boolean;
  onPress: () => void;
  onToggleFavorite: () => void;
  isFavorite?: boolean;
}

export const ArticleCard: React.FC<ArticleCardProps> = ({
  article,
  variant,
  isMobile = false,
  onPress,
  onToggleFavorite,
  isFavorite = false,
}) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handleFavoritePress = () => {
    scale.value = withSpring(1.3, undefined, () => {
      scale.value = withSpring(1);
    });
    onToggleFavorite();
  };

  const getBackgroundColor = () => {
    if (variant === "favorite") {
      return Colors.background;
    } else {
      return article.read
        ? Colors.cardReadBackground
        : Colors.cardUnreadBackground;
    }
  };

  return (
    <Pressable onPress={onPress}>
      <Card style={[styles.card, { backgroundColor: getBackgroundColor() }]}>
        <Card.Content
          style={[
            styles.cardContent,
            isMobile && variant === "feed" && styles.cardContentMobile,
          ]}>
          <View
            style={[
              styles.textContainer,
              variant === "favorite" && styles.favoriteTextContainer,
            ]}>
            <Title style={styles.cardTitle}>{article.title}</Title>
            <Paragraph>{new Date(article.pubDate).toLocaleString()}</Paragraph>
          </View>

          <View
            style={[
              styles.actionContainer,
              isMobile && variant === "feed" && styles.actionContainerMobile,
            ]}>
            <Pressable
              onPress={handleFavoritePress}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              style={styles.favoriteButtonContainer}>
              <Animated.View style={animatedStyle}>
                <IconButton
                  icon={
                    variant === "favorite" || isFavorite
                      ? "heart"
                      : "heart-outline"
                  }
                  size={24}
                />
              </Animated.View>
            </Pressable>
          </View>
        </Card.Content>
      </Card>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    marginVertical: 6,
    marginHorizontal: 4,
  },
  cardContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 8,
  },
  cardContentMobile: {
    flexDirection: "column",
    alignItems: "center",
  },
  textContainer: {
    flex: 1,
  },
  favoriteTextContainer: {
    paddingRight: 8,
  },
  cardTitle: {
    flexShrink: 1,
    flexWrap: "wrap",
    overflow: "hidden",
    color: Colors.text,
  },
  actionContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 8,
  },
  actionContainerMobile: {
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  favoriteButtonContainer: {
    minWidth: 48,
    minHeight: 48,
    justifyContent: "center",
    alignItems: "center",
  },
});
