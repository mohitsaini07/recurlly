import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import clsx from "clsx";
import dayjs from "dayjs";
import { icons } from "@/constants/icons";
import { posthog } from "@/src/config/posthog";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useSubscriptions } from "@/context/SubscriptionContext";

interface CreateSubscriptionModalProps {
  visible: boolean;
  onClose: () => void;
  onCreate: (subscription: any) => void;
}

const CATEGORIES = [
  "Entertainment",
  "AI Tools",
  "Developer Tools",
  "Design",
  "Productivity",
  "Cloud",
  "Music",
  "Other",
];

const CATEGORY_COLORS: Record<string, string> = {
  Entertainment: "#ff9a9e",
  "AI Tools": "#b8d4e3",
  "Developer Tools": "#e8def8",
  Design: "#f5c542",
  Productivity: "#b8e8d0",
  Cloud: "#a1c4fd",
  Music: "#1DB954",
  Other: "#e2e8f0",
};

const getIconFromName = (subName: string) => {
  const normalized = subName.toLowerCase();
  if (normalized.includes("adobe")) return icons.adobe;
  if (normalized.includes("canva")) return icons.canva;
  if (normalized.includes("claude")) return icons.claude;
  if (normalized.includes("dropbox")) return icons.dropbox;
  if (normalized.includes("figma")) return icons.figma;
  if (normalized.includes("github")) return icons.github;
  if (normalized.includes("medium")) return icons.medium;
  if (normalized.includes("notion")) return icons.notion;
  if (normalized.includes("openai") || normalized.includes("chatgpt")) return icons.openai;
  if (normalized.includes("spotify")) return icons.spotify;
  const cleanName = normalized.replace(/[^a-z0-9]/g, '');
  if (!cleanName) return icons.wallet;
  return { uri: `https://icon.horse/icon/${cleanName}.com` };
};

export const CreateSubscriptionModal = ({
  visible,
  onClose,
  onCreate,
}: CreateSubscriptionModalProps) => {
  const insets = useSafeAreaInsets();
  const { currency } = useSubscriptions();
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [frequency, setFrequency] = useState<"Monthly" | "Yearly">("Monthly");
  const [category, setCategory] = useState(CATEGORIES[0]);

  const resetForm = () => {
    setName("");
    setPrice("");
    setFrequency("Monthly");
    setCategory(CATEGORIES[0]);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = () => {
    const numPrice = parseFloat(price);
    if (!name.trim() || isNaN(numPrice) || numPrice <= 0) return;

    const startDate = dayjs().toISOString();
    const renewalDate = dayjs()
      .add(1, frequency === "Monthly" ? "month" : "year")
      .toISOString();

    const RANDOM_COLORS = [
      "#ff9a9e", // pastel pink
      "#b8d4e3", // soft blue
      "#e8def8", // lilac
      "#f5c542", // warm yellow
      "#b8e8d0", // soft mint
      "#a1c4fd", // light periwinkle
      "#ffb199", // soft peach
      "#d4fc79", // lime pastel
      "#e0c3fc", // pastel purple
      "#84fab0", // pastel green
    ];

    const randomColor = RANDOM_COLORS[Math.floor(Math.random() * RANDOM_COLORS.length)];

    const newSub = {
      id: Math.random().toString(36).substr(2, 9),
      name: name.trim(),
      price: numPrice,
      frequency,
      category,
      status: "active",
      startDate,
      renewalDate,
      icon: getIconFromName(name.trim()),
      billing: frequency,
      color: randomColor,
      currency: currency,
      paymentMethod: "New Card",
    };

    onCreate(newSub);

    posthog.capture("subscription_created", {
      subscription_name: name,
      subscription_price: price,
      subscription_frequency: frequency,
      subscription_category: category,
    });

    handleClose();
  };

  const isValid = name.trim().length > 0 && parseFloat(price) > 0;

  return (
    <Modal visible={visible} animationType="slide" transparent statusBarTranslucent={true}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <View className="modal-overlay">
          <TouchableOpacity
            className="flex-1"
            activeOpacity={1}
            onPress={handleClose}
          />

          <View 
            className="modal-container" 
            style={{ paddingBottom: Math.max(insets.bottom, 20) }}
          >
            <View className="modal-header">
              <Text className="modal-title">New Subscription</Text>
              <TouchableOpacity className="modal-close" onPress={handleClose}>
                <Ionicons name="close" size={20} color="#081126" />
              </TouchableOpacity>
            </View>

            <ScrollView
              className="modal-body"
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 40 }}
            >
              <View className="auth-field">
                <Text className="auth-label">Name</Text>
                <TextInput
                  className="auth-input"
                  placeholder="e.g. Netflix"
                  placeholderTextColor="rgba(0,0,0,0.4)"
                  value={name}
                  onChangeText={setName}
                />
              </View>

              <View className="auth-field mt-4">
                <Text className="auth-label">Price</Text>
                <TextInput
                  className="auth-input"
                  placeholder="0.00"
                  placeholderTextColor="rgba(0,0,0,0.4)"
                  keyboardType="decimal-pad"
                  value={price}
                  onChangeText={setPrice}
                />
              </View>

              <View className="auth-field mt-4">
                <Text className="auth-label">Frequency</Text>
                <View className="picker-row">
                  <TouchableOpacity
                    className={clsx(
                      "picker-option",
                      frequency === "Monthly" && "picker-option-active",
                    )}
                    onPress={() => setFrequency("Monthly")}
                  >
                    <Text
                      className={clsx(
                        "picker-option-text",
                        frequency === "Monthly" && "picker-option-text-active",
                      )}
                    >
                      Monthly
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    className={clsx(
                      "picker-option",
                      frequency === "Yearly" && "picker-option-active",
                    )}
                    onPress={() => setFrequency("Yearly")}
                  >
                    <Text
                      className={clsx(
                        "picker-option-text",
                        frequency === "Yearly" && "picker-option-text-active",
                      )}
                    >
                      Yearly
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View className="auth-field mt-4">
                <Text className="auth-label">Category</Text>
                <View className="category-scroll">
                  {CATEGORIES.map((cat) => (
                    <TouchableOpacity
                      key={cat}
                      className={clsx(
                        "category-chip",
                        category === cat && "category-chip-active",
                      )}
                      onPress={() => setCategory(cat)}
                    >
                      <Text
                        className={clsx(
                          "category-chip-text",
                          category === cat && "category-chip-text-active",
                        )}
                      >
                        {cat}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <TouchableOpacity
                className={clsx(
                  "auth-button mt-8",
                  !isValid && "auth-button-disabled",
                )}
                onPress={handleSubmit}
                disabled={!isValid}
              >
                <Text className="auth-button-text">Add Subscription</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};
