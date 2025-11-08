# Contributing to Kagoma Contributions App

First off, thank you for considering contributing to Kagoma Contributions App! It's people like you that make this app better for everyone.

## Code of Conduct

By participating in this project, you are expected to uphold our Code of Conduct:
- Be respectful and inclusive
- Welcome newcomers
- Focus on what is best for the community
- Show empathy towards others

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check existing issues to avoid duplicates. When you create a bug report, include as many details as possible:

- **Use a clear and descriptive title**
- **Describe the exact steps to reproduce the problem**
- **Provide specific examples**
- **Describe the behavior you observed and what you expected**
- **Include screenshots if possible**
- **Include your environment details** (OS, Node version, etc.)

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion:

- **Use a clear and descriptive title**
- **Provide a detailed description of the suggested enhancement**
- **Explain why this enhancement would be useful**
- **List any alternative solutions you've considered**

### Pull Requests

1. Fork the repo and create your branch from `main`
2. If you've added code that should be tested, add tests
3. Ensure your code follows the existing style
4. Update the documentation
5. Write a clear commit message

#### Development Process

```bash
# Fork and clone the repository
git clone https://github.com/YOUR_USERNAME/kagoma-bbc-management.git
cd kagoma-bbc-management

# Create a branch
git checkout -b feature/your-feature-name

# Make your changes
# ...

# Test your changes
npm start

# Commit your changes
git add .
git commit -m "Add some feature"

# Push to your fork
git push origin feature/your-feature-name

# Create a Pull Request
```

## Style Guidelines

### Git Commit Messages

- Use the present tense ("Add feature" not "Added feature")
- Use the imperative mood ("Move cursor to..." not "Moves cursor to...")
- Limit the first line to 72 characters
- Reference issues and pull requests after the first line

Examples:
```
Add SMS parsing for Bank of Kigali
Fix crash when syncing to Google Sheets
Update contributor balance calculation
```

### JavaScript Style Guide

- Use 2 spaces for indentation
- Use semicolons
- Use single quotes for strings
- Use meaningful variable names
- Add comments for complex logic
- Follow React Native best practices

Example:
```javascript
// Good
const calculateBalance = (contributions, expenses) => {
  const totalContributions = contributions.reduce((sum, c) => sum + c.amount, 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  return totalContributions - totalExpenses;
};

// Bad
const calc = (c, e) => {
  let t1 = 0;
  for (let i = 0; i < c.length; i++) t1 += c[i].amount;
  let t2 = 0;
  for (let i = 0; i < e.length; i++) t2 += e[i].amount;
  return t1 - t2;
};
```

### Component Structure

```javascript
import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Title } from 'react-native-paper';

const MyComponent = ({ prop1, prop2 }) => {
  // State
  const [state, setState] = useState(initialValue);

  // Effects
  useEffect(() => {
    // Effect logic
  }, [dependencies]);

  // Handlers
  const handleAction = () => {
    // Handler logic
  };

  // Render
  return (
    <View style={styles.container}>
      <Card>
        <Title>My Component</Title>
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default MyComponent;
```

## Project Structure

When adding new features, follow the existing structure:

```
src/
├── screens/        # Screen components
├── components/     # Reusable components
├── services/       # API and business logic
├── database/       # Database operations
├── utils/          # Helper functions
└── theme/          # Styling and theme
```

## Areas for Contribution

Here are some areas where we especially welcome contributions:

### High Priority
- iOS support (without SMS features)
- Additional bank SMS patterns
- Improved error handling
- Performance optimizations
- Accessibility improvements

### Medium Priority
- Export to PDF
- Push notifications
- Advanced charts and analytics
- Dark mode
- Internationalization

### Documentation
- Improve setup guides
- Add video tutorials
- Translate documentation
- Add code examples

## Testing

Before submitting a PR:

1. Test on a physical Android device
2. Test on Android emulator
3. Test SMS reading functionality
4. Test Google Sheets sync
5. Verify no crashes or errors

## Questions?

Feel free to create an issue with your question or reach out to the maintainers.

## Recognition

Contributors will be recognized in:
- README.md Contributors section
- Release notes
- Project documentation

Thank you for contributing to Kagoma Contributions App! 🎉

