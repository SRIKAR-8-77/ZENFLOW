# AWS Step-by-Step Deployment Guide ☁️🧘‍♂️

This guide will walk you through every click to get ZenFlow live on the AWS Free Tier.

## Part 1: Your Backend (AWS EC2)

The backend handles the AI analysis and database.

### 1. Prepare Your Code
Before going to AWS, ensure your project is on GitHub:
1.  **Create a Repo**: Go to GitHub and create a private repository named `ZenFlow`.
2.  **Push Code**: Run these in your local `ZenFlow` folder:
    ```bash
    git init
    git add .
    git commit -m "Production ready"
    git remote add origin https://github.com/your-username/ZenFlow.git
    git push -u origin main
    ```

### 2. Launch the Server (EC2)
1.  **Login**: Go to the [AWS Management Console](https://aws.amazon.com/).
2.  **Find EC2**: Search for "EC2" in the top bar.
3.  **Launch Instance**: Click the orange **"Launch Instance"** button.
4.  **Name It**: Name it `ZenFlow-Backend`.
5.  **Operating System**: Select **Ubuntu** (22.04 LTS).
6.  **Instance Type**: Ensure **t2.micro** is selected (Free Tier).
7.  **Key Pair**: Create a new key pair named `zenflow-key`, download the `.pem` file.
8.  **Network Settings**: 
    - Check "Allow SSH traffic from Anywhere".
    - Check "Allow HTTPS traffic from the internet".
    - Check "Allow HTTP traffic from the internet".
9.  **Click "Launch Instance"**.

### 3. Setup Backend & Transfer Code
1.  **SSH into Server**: `ssh -i "zenflow-key.pem" ubuntu@ec2-your-ip.com`.
2.  **Clone Your Repo**: 
    ```bash
    git clone https://github.com/your-username/ZenFlow.git
    cd ZenFlow
    ```
3.  **Run Zen-Setup**: Copy and paste the script from **[DEPLOYMENT.md](file:///e:/ML%20PROJECTS/ZenFlow/DEPLOYMENT.md)** to install Docker, set up Swap RAM, and start the engine.

---

## Part 2: Your Frontend (AWS Amplify)

The frontend is the website people visit.

1.  **Go to Amplify**: Search for "Amplify" in the AWS Console.
2.  **Create App**: Click "Get Started" under **Amplify Hosting**.
3.  **Choose GitHub**: Select GitHub and click "Next". Authorize AWS and select your `ZenFlow` repository.
4.  **Configure Build**: Amplify will automatically detect Vite. 
    - **App Name**: `ZenFlow-Web`.
    - **Edit Build Settings**: It should show `npm run build` and `dist`.
5.  **Add Environment Variable**: Click "Advanced Settings".
    - **Key**: `VITE_BACKEND_URL`
    - **Value**: `http://YOUR_EC2_PUBLIC_IP:8001` (Replace with your actual EC2 IP).
6.  **Save and Deploy**: Click "Save and Deploy".

### Final Step: Verification
Once Amplify is finished, it will give you a URL (e.g., `https://main.d123.amplifyapp.com`). Open it and enjoy your live sanctuary! 🏛️✨🏙️
