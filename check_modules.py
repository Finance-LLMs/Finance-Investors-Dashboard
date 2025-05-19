import sys
print(f"Python version: {sys.version}")
print(f"Python executable: {sys.executable}")
print(f"Python path: {sys.path}")

try:
    import requests
    print(f"Requests version: {requests.__version__}")
    print(f"Requests path: {requests.__file__}")
except ImportError:
    print("Requests module not found")

print("\nAll installed packages:")
try:
    import pkg_resources
    for pkg in pkg_resources.working_set:
        print(f"{pkg.key} {pkg.version}")
except ImportError:
    print("pkg_resources not available")
