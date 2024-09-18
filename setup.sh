#!/bin/bash

# Ensure that Git hooks directory exists
if [ ! -d ".git/hooks" ]; then
  mkdir -p ".git/hooks"
fi

# Create the pre-commit hook file with content
if [ ! -f ".git/hooks/pre-commit" ]; then
  cat << 'EOF' > ".git/hooks/pre-commit"
#!/bin/sh
# Ensure consistent line endings and avoid committing files with inconsistent line endings

# Configure Git to handle line endings
git config core.autocrlf input
git config core.safecrlf warn

# Optionally, run additional checks or commands here
EOF

  # Make the pre-commit file executable
  chmod +x ".git/hooks/pre-commit"
  echo "Pre-commit hook created."
else
  echo "Pre-commit hook already exists."
fi

# Set core.autocrlf and core.safecrlf settings for Git
git config --global core.autocrlf input
git config --global core.safecrlf warn

# Inform the user
echo "Setup complete. Please run 'yarn install' or 'npm install' in the ProductInsightApp directory."
