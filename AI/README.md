<h1>SecretScan — API Secret Detector</h1>

<div class="section">
<div class="card">
Engineered a machine learning–based security detection system that scans source code snippets to identify exposed API keys, tokens, and confidential credentials. Designed to prevent accidental secret leakage in repositories and reduce automated exploitation risks. Implemented a lightweight classification pipeline using TF-IDF feature extraction and Logistic Regression to proactively flag sensitive tokens.
</div>
</div>

<div class="section">
<h2>Dataset & Preprocessing</h2>
<ul>
<li>Trained on labeled text-based risk classification dataset</li>
<li>Each sample annotated according to severity level</li>
<li>Text cleaning and normalization applied</li>
<li>Whitespace-based tokenization</li>
<li>Label Encoding:
    <ul>
        <li><strong>No Risk → 0</strong></li>
        <li><strong>High Risk → 1</strong></li>
        <li><strong>Critical → 2</strong></li>
    </ul>
</li>
</ul>
</div>

<div class="section">
<h2>Core Technical Implementation</h2>
<ul>
<li>Character and token-level statistical pattern recognition</li>
<li>TF-IDF numerical feature representation</li>
<li>Logistic Regression classifier for fast inference</li>
<li>Sparse feature optimization</li>
<li>Deterministic prediction outputs</li>
</ul>
</div>

<div class="section">
<h2>Technologies Used</h2>
<ul>
<li>Python</li>
<li>Scikit-learn (TF-IDF, Logistic Regression, Evaluation)</li>
<li>Pandas (Data Processing)</li>
<li>NumPy (Numerical Computation)</li>

</ul>
</div>

<div class="section">
<h2>Performance Strengths</h2>
<ul>
<li>Lightweight architecture</li>
<li>Real-time detection capability</li>
<li>Low computational overhead</li>

</ul>
</div>

<div class="section">
<h2>Example Detection</h2>
<pre>
Input:
api_key = "ABCD1234XYZ"

Output:
Risk Level → High
</pre>
</div>





