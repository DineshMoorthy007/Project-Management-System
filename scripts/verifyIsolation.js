const PORT = process.env.PORT || 5000;
const BASE_URL = `http://localhost:${PORT}`;

// ANSI escape sequences for terminal colors
const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const CYAN = '\x1b[36m';
const RESET = '\x1b[0m';

async function runTest() {
  console.log(`${CYAN}[QA System Audit] Initiating Tenant Isolation Verification...${RESET}\n`);

  try {
    const timestamp = Date.now();
    const emailA = `usera_${timestamp}@example.com`;
    const emailB = `userb_${timestamp}@example.com`;

    // ----------------------------------------------------
    // STEP 1: User A Registration & Authentication
    // ----------------------------------------------------
    console.log(`${YELLOW}[User A] Registering User A (${emailA})...${RESET}`);
    const regResA = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: 'User A',
        email: emailA,
        password: 'password123'
      })
    });
    if (!regResA.ok) {
      throw new Error(`Failed to register User A: ${regResA.status} - ${await regResA.text()}`);
    }

    console.log(`${YELLOW}[User A] Logging in User A...${RESET}`);
    const loginResA = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: emailA,
        password: 'password123'
      })
    });
    if (!loginResA.ok) {
      throw new Error(`Failed to login User A: ${loginResA.status}`);
    }
    const loginDataA = await loginResA.json();
    const tokenA = loginDataA.data.token;
    console.log(`${GREEN}[User A] Authentication successful.${RESET}`);

    // ----------------------------------------------------
    // STEP 2: User A creates project 'Alpha Secret'
    // ----------------------------------------------------
    console.log(`${YELLOW}[User A] Creating Project 'Alpha Secret'...${RESET}`);
    const projectRes = await fetch(`${BASE_URL}/api/projects`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${tokenA}`
      },
      body: JSON.stringify({
        name: 'Alpha Secret',
        description: 'Confidential project details for User A only.'
      })
    });
    if (!projectRes.ok) {
      throw new Error(`Failed to create project: ${projectRes.status} - ${await projectRes.text()}`);
    }
    const projectData = await projectRes.json();
    
    // Support either structured wrapping or flat response
    const project = projectData.data || projectData;
    const projectId = project.id;
    console.log(`${GREEN}[User A] Project created successfully. ID: ${projectId}${RESET}`);

    // ----------------------------------------------------
    // STEP 3: User B Registration & Authentication
    // ----------------------------------------------------
    console.log(`\n${YELLOW}[User B] Registering User B (${emailB})...${RESET}`);
    const regResB = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: 'User B',
        email: emailB,
        password: 'password123'
      })
    });
    if (!regResB.ok) {
      throw new Error(`Failed to register User B: ${regResB.status}`);
    }

    console.log(`${YELLOW}[User B] Logging in User B...${RESET}`);
    const loginResB = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: emailB,
        password: 'password123'
      })
    });
    if (!loginResB.ok) {
      throw new Error(`Failed to login User B: ${loginResB.status}`);
    }
    const loginDataB = await loginResB.json();
    const tokenB = loginDataB.data.token;
    console.log(`${GREEN}[User B] Authentication successful.${RESET}`);

    // ----------------------------------------------------
    // STEP 4: Breach Test 1 - GET Project by specific ID
    // ----------------------------------------------------
    console.log(`\n${CYAN}[Breach Test 1] User B attempting to read Project ID ${projectId} (User A's)...${RESET}`);
    const getProjectRes = await fetch(`${BASE_URL}/api/projects/${projectId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${tokenB}`
      }
    });

    let breachDetected = false;
    let test1Status = getProjectRes.status;

    if (getProjectRes.ok) {
      const projectBody = await getProjectRes.json();
      console.log(`${RED}[SECURITY CRITICAL] Breach detected! User B successfully read User A's project details:${RESET}`);
      console.log(JSON.stringify(projectBody, null, 2));
      breachDetected = true;
    } else {
      console.log(`${GREEN}[Isolation OK] Request blocked. Status: ${test1Status} (Expected: 403 Forbidden or 404 Not Found)${RESET}`);
    }

    // ----------------------------------------------------
    // STEP 5: Breach Test 2 - GET all projects
    // ----------------------------------------------------
    console.log(`${CYAN}[Breach Test 2] User B attempting to fetch all projects...${RESET}`);
    const getAllRes = await fetch(`${BASE_URL}/api/projects`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${tokenB}`
      }
    });

    let test2Status = getAllRes.status;
    let listContainsSecret = false;

    if (getAllRes.ok) {
      const listBody = await getAllRes.json();
      const projectsList = listBody.data || listBody;

      if (Array.isArray(projectsList)) {
        listContainsSecret = projectsList.some(p => p.id === projectId || p.name === 'Alpha Secret');
        if (listContainsSecret) {
          console.log(`${RED}[SECURITY CRITICAL] Breach detected! User B's project list contains User A's secret project!${RESET}`);
        } else {
          console.log(`${GREEN}[Isolation OK] Project list does not contain User A's project. Projects count returned: ${projectsList.length}${RESET}`);
        }
      } else {
        console.log(`${RED}[Format Error] Get-all response is not an array.${RESET}`);
        breachDetected = true;
      }
    } else {
      console.log(`${RED}[Response Error] Failed to fetch project list as User B. Status: ${test2Status}${RESET}`);
      // If endpoint fails completely, isolation is not breached, but database config is broken
      breachDetected = true; 
    }

    // ----------------------------------------------------
    // STEP 6: Final Verification Decision
    // ----------------------------------------------------
    console.log(`\n${CYAN}==================================================${RESET}`);
    if (!breachDetected && !listContainsSecret && (test1Status === 403 || test1Status === 404)) {
      console.log(`${GREEN}  STATUS: SUCCESS - TENANT ISOLATION WORKS PERFECTLY!${RESET}`);
      console.log(`${GREEN}  User B is successfully blocked from viewing User A's projects.${RESET}`);
    } else {
      console.log(`${RED}  STATUS: FAILED - PRIVILEGE ESCALATION VULNERABILITY FOUND!${RESET}`);
      console.log(`${RED}  Cross-tenant access was not correctly isolated.${RESET}`);
      process.exitCode = 1;
    }
    console.log(`${CYAN}==================================================${RESET}\n`);

  } catch (error) {
    console.error(`\n${RED}[QA System Error] Test sequence crashed:${RESET}`);
    console.error(error.message);
    process.exitCode = 1;
  }
}

runTest();
