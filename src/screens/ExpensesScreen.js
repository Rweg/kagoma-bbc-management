import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  RefreshControl,
  Alert,
} from 'react-native';
import {
  Card,
  Title,
  Paragraph,
  Button,
  FAB,
  Portal,
  Modal,
  TextInput,
  Chip,
  Text,
  List,
  Badge,
} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {
  getExpenses,
  addExpense,
  approveExpense,
  getUnprocessedSMS,
  markSMSAsProcessed,
} from '../database/database';
import { syncRecentSMS, extractAmount } from '../services/smsService';
import { colors } from '../theme/theme';
import { format } from 'date-fns';

const EXPENSE_CATEGORIES = [
  'Equipment',
  'Transportation',
  'Venue Rental',
  'Uniforms',
  'Referee Fees',
  'Tournament Fees',
  'Food & Drinks',
  'Training Materials',
  'Medical Supplies',
  'Other',
];

const ExpensesScreen = ({ navigation }) => {
  const [expenses, setExpenses] = useState([]);
  const [unprocessedSMS, setUnprocessedSMS] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [smsModalVisible, setSmsModalVisible] = useState(false);
  const [selectedSMS, setSelectedSMS] = useState(null);
  
  const [formData, setFormData] = useState({
    amount: '',
    category: 'Other',
    description: '',
    notes: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const expensesList = await getExpenses();
      setExpenses(expensesList);

      const sms = await getUnprocessedSMS();
      setUnprocessedSMS(sms.filter(s => s.type.includes('SENT')));
    } catch (error) {
      console.error('Error loading expenses:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleSyncSMS = async () => {
    try {
      Alert.alert(
        'Sync SMS',
        'This will scan your SMS messages for payments and expenses. Continue?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Sync',
            onPress: async () => {
              const result = await syncRecentSMS(30);
              if (result.success) {
                Alert.alert('Success', `Found ${result.processed} financial messages`);
                await loadData();
              } else {
                Alert.alert('Error', result.error);
              }
            },
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to sync SMS');
    }
  };

  const handleSMSSelection = (sms) => {
    setSelectedSMS(sms);
    const amount = extractAmount(sms.content);
    setFormData({
      ...formData,
      amount: amount ? amount.toString() : '',
    });
    setSmsModalVisible(true);
  };

  const handleAddExpense = async () => {
    try {
      if (!formData.amount || !formData.category) {
        Alert.alert('Error', 'Please enter an amount and select a category');
        return;
      }

      await addExpense(
        parseFloat(formData.amount),
        formData.category,
        formData.description,
        selectedSMS ? selectedSMS.content : null,
        selectedSMS ? selectedSMS.sender : null,
        formData.notes
      );

      if (selectedSMS) {
        await markSMSAsProcessed(selectedSMS.id);
      }

      Alert.alert('Success', 'Expense added successfully. It requires approval before being deducted from balance.');
      setModalVisible(false);
      setSmsModalVisible(false);
      setSelectedSMS(null);
      setFormData({
        amount: '',
        category: 'Other',
        description: '',
        notes: '',
      });
      await loadData();
    } catch (error) {
      console.error('Error adding expense:', error);
      Alert.alert('Error', 'Failed to add expense');
    }
  };

  const handleApproveExpense = (expenseId) => {
    Alert.alert(
      'Approve Expense',
      'Are you sure you want to approve this expense? It will be deducted from the team balance.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Approve',
          onPress: async () => {
            try {
              await approveExpense(expenseId);
              Alert.alert('Success', 'Expense approved');
              await loadData();
            } catch (error) {
              Alert.alert('Error', 'Failed to approve expense');
            }
          },
        },
      ]
    );
  };

  const formatCurrency = (amount) => {
    return `${amount.toLocaleString()} FRW`;
  };

  const getCategoryIcon = (category) => {
    const icons = {
      'Equipment': 'basketball',
      'Transportation': 'bus',
      'Venue Rental': 'home-city',
      'Uniforms': 'tshirt-crew',
      'Referee Fees': 'whistle',
      'Tournament Fees': 'trophy',
      'Food & Drinks': 'food',
      'Training Materials': 'book-open-variant',
      'Medical Supplies': 'medical-bag',
      'Other': 'cash',
    };
    return icons[category] || 'cash';
  };

  const getPendingCount = () => {
    return expenses.filter(e => !e.approved).length;
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Unprocessed SMS Alert */}
        {unprocessedSMS.length > 0 && (
          <Card style={[styles.card, styles.alertCard]}>
            <Card.Content>
              <View style={styles.alertContent}>
                <Icon name="message-alert" size={24} color={colors.error} />
                <View style={styles.alertText}>
                  <Title style={styles.alertTitle}>
                    {unprocessedSMS.length} New Payments Detected
                  </Title>
                  <Paragraph>
                    Review SMS messages for team-related expenses
                  </Paragraph>
                </View>
              </View>
              <ScrollView horizontal style={styles.smsPreviewContainer}>
                {unprocessedSMS.slice(0, 3).map((sms) => (
                  <Card
                    key={sms.id}
                    style={styles.smsPreviewCard}
                    onPress={() => handleSMSSelection(sms)}
                  >
                    <Card.Content>
                      <Paragraph numberOfLines={2} style={styles.smsPreview}>
                        {sms.content}
                      </Paragraph>
                      <Text style={styles.smsPreviewDate}>
                        {format(new Date(sms.date), 'MMM dd')}
                      </Text>
                    </Card.Content>
                  </Card>
                ))}
              </ScrollView>
            </Card.Content>
          </Card>
        )}

        {/* Summary Card */}
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.summaryRow}>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Pending Approval</Text>
                <Title style={[styles.summaryValue, { color: colors.warning }]}>
                  {getPendingCount()}
                </Title>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Total Approved</Text>
                <Title style={[styles.summaryValue, { color: colors.error }]}>
                  {formatCurrency(
                    expenses
                      .filter(e => e.approved)
                      .reduce((sum, e) => sum + e.amount, 0)
                  )}
                </Title>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <Button
            mode="outlined"
            icon="message-text-clock"
            onPress={handleSyncSMS}
            style={styles.syncButton}
          >
            Sync SMS
          </Button>
        </View>

        {/* Expenses List */}
        <Card style={styles.card}>
          <Card.Content>
            <Title>All Expenses</Title>
            {expenses.length === 0 ? (
              <Paragraph style={styles.emptyText}>
                No expenses recorded yet. Add your first expense using the + button below.
              </Paragraph>
            ) : (
              expenses.map((item) => (
                <List.Item
                  key={item.id}
                  title={item.category}
                  description={`${format(new Date(item.date), 'MMM dd, yyyy')}${
                    item.description ? ` • ${item.description}` : ''
                  }`}
                  left={(props) => (
                    <List.Icon
                      {...props}
                      icon={getCategoryIcon(item.category)}
                      color={item.approved ? colors.error : colors.warning}
                    />
                  )}
                  right={(props) => (
                    <View style={styles.expenseRight}>
                      <Text style={[styles.amount, { color: colors.error }]}>
                        -{formatCurrency(item.amount)}
                      </Text>
                      {!item.approved ? (
                        <View style={styles.approvalContainer}>
                          <Badge style={styles.pendingBadge}>Pending</Badge>
                          <Button
                            mode="text"
                            compact
                            onPress={() => handleApproveExpense(item.id)}
                          >
                            Approve
                          </Button>
                        </View>
                      ) : (
                        <View style={styles.approvalContainer}>
                          <Icon name="check-circle" size={16} color={colors.success} />
                          {item.synced_to_sheets && (
                            <Icon name="cloud-check" size={16} color={colors.success} />
                          )}
                        </View>
                      )}
                    </View>
                  )}
                  style={styles.listItem}
                />
              ))
            )}
          </Card.Content>
        </Card>

        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Manual Add Expense Modal */}
      <Portal>
        <Modal
          visible={modalVisible}
          onDismiss={() => setModalVisible(false)}
          contentContainerStyle={styles.modal}
        >
          <Title>Add Expense</Title>
          
          <TextInput
            label="Amount (FRW)"
            value={formData.amount}
            onChangeText={(text) => setFormData({ ...formData, amount: text })}
            keyboardType="numeric"
            mode="outlined"
            style={styles.input}
          />

          <Text style={styles.label}>Category</Text>
          <ScrollView style={styles.chipContainer}>
            <View style={styles.chipGrid}>
              {EXPENSE_CATEGORIES.map((category) => (
                <Chip
                  key={category}
                  selected={formData.category === category}
                  onPress={() => setFormData({ ...formData, category })}
                  style={styles.chip}
                  icon={getCategoryIcon(category)}
                >
                  {category}
                </Chip>
              ))}
            </View>
          </ScrollView>

          <TextInput
            label="Description"
            value={formData.description}
            onChangeText={(text) => setFormData({ ...formData, description: text })}
            mode="outlined"
            multiline
            numberOfLines={2}
            style={styles.input}
          />

          <TextInput
            label="Notes (Optional)"
            value={formData.notes}
            onChangeText={(text) => setFormData({ ...formData, notes: text })}
            mode="outlined"
            multiline
            numberOfLines={2}
            style={styles.input}
          />

          <View style={styles.modalButtons}>
            <Button onPress={() => setModalVisible(false)}>Cancel</Button>
            <Button mode="contained" onPress={handleAddExpense}>
              Add Expense
            </Button>
          </View>
        </Modal>

        {/* SMS-based Expense Modal */}
        <Modal
          visible={smsModalVisible}
          onDismiss={() => {
            setSmsModalVisible(false);
            setSelectedSMS(null);
          }}
          contentContainerStyle={styles.modal}
        >
          <Title>Add Expense from SMS</Title>
          
          {selectedSMS && (
            <Card style={styles.smsCard}>
              <Card.Content>
                <Paragraph style={styles.smsContent}>
                  {selectedSMS.content}
                </Paragraph>
                <Text style={styles.smsDate}>
                  {format(new Date(selectedSMS.date), 'MMM dd, yyyy HH:mm')}
                </Text>
              </Card.Content>
            </Card>
          )}

          <TextInput
            label="Amount (FRW)"
            value={formData.amount}
            onChangeText={(text) => setFormData({ ...formData, amount: text })}
            keyboardType="numeric"
            mode="outlined"
            style={styles.input}
          />

          <Text style={styles.label}>Was this for the team?</Text>
          <ScrollView style={styles.chipContainer}>
            <View style={styles.chipGrid}>
              {EXPENSE_CATEGORIES.map((category) => (
                <Chip
                  key={category}
                  selected={formData.category === category}
                  onPress={() => setFormData({ ...formData, category })}
                  style={styles.chip}
                  icon={getCategoryIcon(category)}
                >
                  {category}
                </Chip>
              ))}
            </View>
          </ScrollView>

          <TextInput
            label="Description"
            value={formData.description}
            onChangeText={(text) => setFormData({ ...formData, description: text })}
            mode="outlined"
            multiline
            numberOfLines={2}
            style={styles.input}
          />

          <View style={styles.modalButtons}>
            <Button
              onPress={() => {
                setSmsModalVisible(false);
                setSelectedSMS(null);
              }}
            >
              Skip
            </Button>
            <Button mode="contained" onPress={handleAddExpense}>
              Add Expense
            </Button>
          </View>
        </Modal>
      </Portal>

      {/* Floating Action Button */}
      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => setModalVisible(true)}
        color={colors.white}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.light,
  },
  scrollView: {
    flex: 1,
  },
  card: {
    margin: 16,
    marginBottom: 8,
    elevation: 2,
  },
  alertCard: {
    backgroundColor: '#ffebee',
    borderLeftWidth: 4,
    borderLeftColor: colors.error,
  },
  alertContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  alertText: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 16,
    marginBottom: 4,
  },
  smsPreviewContainer: {
    marginTop: 12,
  },
  smsPreviewCard: {
    width: 200,
    marginRight: 8,
  },
  smsPreview: {
    fontSize: 12,
    marginBottom: 4,
  },
  smsPreviewDate: {
    fontSize: 10,
    color: colors.gray,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 12,
    color: colors.gray,
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  actionButtons: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  syncButton: {
    borderColor: colors.primary,
  },
  listItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  expenseRight: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: 4,
  },
  amount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  approvalContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  pendingBadge: {
    backgroundColor: colors.warning,
  },
  emptyText: {
    textAlign: 'center',
    color: colors.gray,
    paddingVertical: 20,
  },
  modal: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: 8,
    maxHeight: '80%',
  },
  label: {
    fontSize: 14,
    color: colors.gray,
    marginTop: 12,
    marginBottom: 8,
  },
  chipContainer: {
    maxHeight: 200,
    marginBottom: 12,
  },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    marginBottom: 8,
  },
  input: {
    marginBottom: 12,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 12,
  },
  smsCard: {
    marginBottom: 16,
    backgroundColor: colors.light,
  },
  smsContent: {
    fontSize: 13,
    lineHeight: 20,
  },
  smsDate: {
    fontSize: 11,
    color: colors.gray,
    marginTop: 8,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: colors.primary,
  },
  bottomPadding: {
    height: 80,
  },
});

export default ExpensesScreen;

