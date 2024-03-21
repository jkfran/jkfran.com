---
layout: post
title: "Validating JSON Outputs in MLflow with Custom Metrics"
author: jkfran
categories: [blog]
image: https://github.com/jkfran/jkfran.com/assets/6353928/a8ed0521-a89e-4606-9922-13c5df584fd6
---


Welcome to a new post on my blog. We'll delve into an interesting aspect of working with MLflow – adding a custom metric to validate JSON outputs. This tutorial is particularly useful for developers and data scientists looking to ensure the integrity and structure of their model's outputs when JSON is expected.

#### Why Validate JSON Outputs?

In the world of machine learning and data science, models often need to output data in structured formats, JSON being one of the most popular due to its versatility and wide adoption in web services and applications. Ensuring your model reliably produces valid JSON responses is crucial, especially in production environments where data consistency and integrity are paramount.

#### Introducing Custom Metrics in MLflow

MLflow, an open-source platform for the machine learning lifecycle, includes capabilities for tracking experiments, packaging code into reproducible runs, and managing models. However, it might not natively support specific validation checks like verifying JSON output. This is where custom metrics come into play.

#### Step-by-Step Guide to Creating a JSON Validity Metric

Below is a detailed walkthrough on how to implement a custom metric in MLflow for checking JSON validity. This script demonstrates adding such a metric and using it to evaluate a model's predictions.

##### 1. Define the JSON Validity Evaluation Function

First, we define an evaluation function that checks if a given string is valid JSON. This function iterates through each model prediction, validating each one and appending the result (1 for valid, 0 for invalid) to a list of scores.

```python
def _json_validity_eval_fn(outputs, references):
    validity_scores = []
    for _, row in outputs.iterrows():
        prediction = row["prediction"]
        if _is_valid_json(prediction):
            validity_scores.append(1)
        else:
            validity_scores.append(0)
    return MetricValue(validity_scores)
```

##### 2. Implement a Helper Function to Check JSON Validity

A helper function uses Python's `json.loads` method to determine if a string is a valid JSON. It returns True for valid JSON strings and False otherwise.

```python
def _is_valid_json(s):
    try:
        json.loads(s)
        return True
    except ValueError:
        return False
```

##### 3. Create the Custom Metric

We then wrap our evaluation function in a custom metric definition using MLflow's `make_metric` function, specifying our evaluation function, whether a higher score is better, and a name for the metric.

```python
def json_validity() -> EvaluationMetric:
    return make_metric(
        eval_fn=_json_validity_eval_fn,
        greater_is_better=True,
        name="json_validity",
    )
```

##### 4. Evaluate the Model

With the custom metric defined, we can now use it to evaluate a model's output. In this example, we use a remote tracking server plus MLflow deployments, feel free to adapt this to your needs, the DataFrame in my example are two inputs designed to produce JSON outputs and invoke `mlflow.evaluate` with our custom metric.

```python
# Point the client to the local MLflow Deployments Server and set tracking URI
set_deployments_target("http://localhost:7000")
mlflow.set_tracking_uri("http://localhost:5000")

# Evaluate the model with the custom metric
with mlflow.start_run() as run:
    results = mlflow.evaluate(
        model="endpoints:/chatgpt-35-turbo",
        data=eval_data,
        inference_params={"max_tokens": 100, "temperature": 0.0},
        extra_metrics=[json_validity()],
    )
```

##### Final code

```python
import json
import mlflow
import pandas as pd
from mlflow.deployments import set_deployments_target
from mlflow.metrics.base import MetricValue
from mlflow.models import EvaluationMetric, make_metric


def _json_validity_eval_fn(outputs, references):
    # Initialize a list to store validity scores
    validity_scores = []

    # Iterate over each row in the DataFrame
    for _, row in outputs.iterrows():
        # Extract the prediction from the current row
        prediction = row["prediction"]

        # Check if the prediction is a valid JSON
        if _is_valid_json(prediction):
            validity_scores.append(1)  # Valid JSON
        else:
            validity_scores.append(0)  # Invalid JSON

    # Return a MetricValue object with the scores
    return MetricValue(validity_scores)


def _is_valid_json(s):
    """
    Helper function to check if a string is a valid JSON.
    """
    try:
        json.loads(s)
        return True
    # json.decoder.JSONDecodeError inherits from ValueError
    except ValueError:
        return False


def json_validity() -> EvaluationMetric:
    """
    Creates a metric for evaluating the validity of JSON strings produced by a model.
    """
    return make_metric(
        eval_fn=_json_validity_eval_fn,
        greater_is_better=True,
        name="json_validity",
    )


# Point the client to the local MLflow Deployments Server
set_deployments_target("http://localhost:7000")
mlflow.set_tracking_uri("http://localhost:5000")

# Create a test case of inputs that will be passed into the model and ground_truth
eval_data = pd.DataFrame(
    {
        "inputs": [
            'Convert the following description into a JSON object: MLflow is an open source platform for the machine learning lifecycle, including experimentation, reproducibility, and deployment. Structure the JSON with keys for "name", "description", and "features".',
            "Provide a brief explanation of what Apache Spark is.",
        ]
    }
)

with mlflow.start_run() as run:
    results = mlflow.evaluate(
        model="endpoints:/chatgpt-35-turbo",
        data=eval_data,
        inference_params={"max_tokens": 100, "temperature": 0.0},
        # model_type="question-answering",
        # Include the custom metric for JSON validation
        extra_metrics=[json_validity()],
    )

    # Print aggregated evaluation results
    print(f"Aggregated evaluation results: \n{results.metrics}")

    # Evaluation result for each data record is available in results.tables
    eval_table = results.tables["eval_results_table"]
    print(f"Evaluation table: \n{eval_table}")
```

#### Conclusion

Adding custom metrics to MLflow allows for flexible and precise evaluation of your models, tailored to your specific needs. By validating JSON outputs, you ensure that your model meets the requirements for structured data output, enhancing its reliability and applicability in real-world scenarios.

I hope this tutorial has been helpful. As always, I encourage you to experiment with this script and adapt it to your projects. Happy coding!
