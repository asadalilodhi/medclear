import os
import glob

def replace_in_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Replace bg-white
    content = content.replace('bg-white', 'bg-brand-surface')
    # Replace text-brand-charcoal
    content = content.replace('text-brand-charcoal', 'text-brand-text')
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

def main():
    tsx_files = glob.glob('src/**/*.tsx', recursive=True)
    for f in tsx_files:
        replace_in_file(f)
        print(f"Updated {f}")

if __name__ == "__main__":
    main()
