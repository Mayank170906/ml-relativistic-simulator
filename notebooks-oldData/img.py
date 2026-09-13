from pathlib import Path

import numpy as np
import pandas as pd
import matplotlib.pyplot as plt


# ============================================================
# PROJECT PATHS
# ============================================================

# Project root:
# F:\Mayank\ml-research\ml-relativistic-simulator
PROJECT_ROOT = Path(__file__).resolve().parent.parent

# Output folder:
IMAGE_DIR = PROJECT_ROOT / "data" / "image_folder"

# Create folder if it doesn't exist
IMAGE_DIR.mkdir(parents=True, exist_ok=True)


# ============================================================
# FEATURE NAMES
# ============================================================

features = [
    "mass",
    "force",
    "initial_velocity",
    "initial_beta",
    "time",
    "position",
    "velocity",
    "beta",
    "gamma",
    "momentum",
    "kinetic_energy",
    "total_energy",
    "proper_time",
]


# ============================================================
# TRAIN MEDIANS
# ============================================================

train_median = np.array([
    5.048120e+03,
    5.000960e+06,
    1.347732e+08,
    4.495551e-01,
    4.997704e+01,
    5.031718e+09,
    1.348620e+08,
    4.498512e-01,
    1.119691e+00,
    5.950581e+11,
    3.968616e+19,
    5.399742e+20,
    4.018106e+01,
])


# ============================================================
# EXTREME TEST MEDIANS
# ============================================================

test_median = np.array([
    1.091834e+03,
    -1.366950e+00,
    1.705684e+08,
    5.689551e-01,
    3.100380e+00,
    1.827811e+08,
    1.713071e+08,
    5.714191e-01,
    1.268535e+00,
    2.392526e+11,
    2.525634e+19,
    2.241641e+20,
    1.924362e+00,
])


# ============================================================
# TRAIN QUARTILES
# ============================================================

train_q25 = np.array([
    2.574907168e+03,
    2.506382e+06,
    6.746869e+07,
    2.25051e-01,
    2.4938772e+01,
    1.825149e+09,
    6.757697e+07,
    2.25412e-01,
    1.026416e+00,
    2.089505e+11,
    7.635749e+18,
    2.754277e+20,
    2.0078088e+01,
])

train_q75 = np.array([
    7.526051683e+03,
    7.501198e+06,
    2.024531e+08,
    6.75311e-01,
    7.4965319e+01,
    1.031368e+10,
    2.024993e+08,
    6.75465e-01,
    1.356131e+00,
    1.345886e+12,
    1.399254e+20,
    8.054848e+20,
    6.2006395e+01,
])


# ============================================================
# EXTREME TEST QUARTILES
# ============================================================

test_q25 = np.array([
    3.4510756e+01,
    -1.16753816716e+05,
    8.444282e+07,
    2.81671e-01,
    1.7756e-02,
    1.009393e+06,
    7.787502e+07,
    2.59763e-01,
    1.050707e+00,
    6.379333e+09,
    7.894373e+17,
    6.914221e+18,
    1.1367e-02,
])

test_q75 = np.array([
    3.2848625088e+04,
    6.989126e+04,
    2.510658e+08,
    8.37465e-01,
    5.29083133e+02,
    4.112847e+10,
    2.561368e+08,
    8.54380e-01,
    2.089808e+00,
    7.181745e+12,
    7.945522e+20,
    5.379274e+21,
    2.49207784e+02,
])


# ============================================================
# CREATE INDIVIDUAL FEATURE PLOTS
# ============================================================

for i, feature in enumerate(features):

    fig, ax = plt.subplots(figsize=(9, 5.5))

    # --------------------------------------------------------
    # Train IQR
    # --------------------------------------------------------

    ax.axhspan(
        train_q25[i],
        train_q75[i],
        alpha=0.18,
        label="Train IQR",
    )

    # --------------------------------------------------------
    # Extreme Test IQR
    # --------------------------------------------------------

    ax.axhspan(
        test_q25[i],
        test_q75[i],
        alpha=0.12,
        label="Extreme Test IQR",
    )

    # --------------------------------------------------------
    # Train Median
    # --------------------------------------------------------

    ax.axhline(
        train_median[i],
        linestyle="-",
        linewidth=2,
        label="Train Median",
    )

    # --------------------------------------------------------
    # Extreme Test Median
    # --------------------------------------------------------

    ax.axhline(
        test_median[i],
        linestyle="--",
        linewidth=2,
        label="Extreme Test Median",
    )

    # --------------------------------------------------------
    # Title / labels
    # --------------------------------------------------------

    ax.set_title(
        f"{feature}: Train vs Extreme Test",
        fontsize=14,
    )

    ax.set_ylabel(feature)

    ax.set_xticks([])

    ax.grid(
        True,
        alpha=0.25,
    )

    # --------------------------------------------------------
    # Use logarithmic scale for large positive ranges
    # --------------------------------------------------------

    values = [
        train_q25[i],
        train_q75[i],
        test_q25[i],
        test_q75[i],
        train_median[i],
        test_median[i],
    ]

    if min(values) > 0:

        positive_values = [
            value for value in values
            if value > 0
        ]

        if (
            max(positive_values) /
            min(positive_values)
        ) > 100:

            ax.set_yscale("log")

    # --------------------------------------------------------
    # Legend
    # --------------------------------------------------------

    ax.legend()

    fig.tight_layout()

    # --------------------------------------------------------
    # Save
    # --------------------------------------------------------

    output_file = (
        IMAGE_DIR /
        f"{feature}_train_vs_extreme_test.png"
    )

    fig.savefig(
        output_file,
        dpi=180,
        bbox_inches="tight",
    )

    plt.close(fig)

    print(f"Saved: {output_file}")


# ============================================================
# MEDIAN RATIO
# ============================================================

# Extreme test median / train median
median_ratio = (
    test_median /
    train_median
)


# ============================================================
# MEDIAN RATIO PLOT
# ============================================================

fig, ax = plt.subplots(
    figsize=(12, 6)
)

x = np.arange(len(features))

ax.bar(
    x,
    median_ratio,
)

ax.axhline(
    1.0,
    linestyle="--",
    linewidth=1.5,
    label="Same as Train Median",
)

ax.set_title(
    "Extreme Test Median / Train Median",
    fontsize=14,
)

ax.set_ylabel(
    "Median Ratio"
)

ax.set_xticks(x)

ax.set_xticklabels(
    features,
    rotation=60,
    ha="right",
)

ax.set_yscale(
    "symlog",
    linthresh=1,
)

ax.grid(
    True,
    axis="y",
    alpha=0.25,
)

ax.legend()

fig.tight_layout()


ratio_file = (
    IMAGE_DIR /
    "median_ratio_train_vs_extreme_test.png"
)

fig.savefig(
    ratio_file,
    dpi=180,
    bbox_inches="tight",
)

plt.close(fig)

print(f"Saved: {ratio_file}")


# ============================================================
# CREATE SUMMARY DATAFRAME
# ============================================================

summary = pd.DataFrame({
    "feature": features,

    "train_median": train_median,

    "test_median": test_median,

    "train_q25": train_q25,

    "train_q75": train_q75,

    "test_q25": test_q25,

    "test_q75": test_q75,

    "test_median_div_train_median": median_ratio,
})


# ============================================================
# SAVE SUMMARY CSV
# ============================================================

summary_file = (
    IMAGE_DIR /
    "distribution_summary.csv"
)

summary.to_csv(
    summary_file,
    index=False,
)


# ============================================================
# FINAL OUTPUT
# ============================================================

print()
print("=" * 60)
print("DONE")
print("=" * 60)

print(f"Project root:")
print(PROJECT_ROOT)

print()

print(f"Images saved to:")
print(IMAGE_DIR)

print()

print(f"Summary saved to:")
print(summary_file)

print()

print(
    f"Generated {len(features)} feature plots "
    f"+ 1 median-ratio plot."
)