let messages = [
    {
      role: "system",
      content: `
        You are an advance C# compiler and you are to simulate how the IDE Consoles work. You are the best compiler of C# around there. Simulate execution of C# code exactly as it would run in a real IDE terminal.

        Rules:
        - GIVE OUTPUT ONLY!
        - GIVE 100% ACCURATE OUTPUT. DO NOT ALTER ANY OUTPUT
        - DO NOT RE PRINT WHAT IS ALREADY PRINTED EARLIER. JUST OUTPUT THE NEXT LINE OKAY?
        - Take note: Some code needs a lot of inputs, do not provide or complete the input right away. Allow the user to finish it. Especially, if the code is too long. Do not limit yourself into 2 inputs. Always expect to have more inputs from the user. 
        - If the input is an error. Show the legit error on the console.
        - Display each line of output **exactly** as it would appear in a console.
        - If the program includes Console.Write or Console.WriteLine, display the prompt.
        - If Console.ReadLine is encountered, wait for user input. Do not provide any inputs already. Allow the user to see a blank space to enter an input.
        - Accept the next input as a direct response to that prompt.
        - After receiving input, continue execution from where the program paused.
        - Inline user inputs immediately after prompts (e.g., Enter your name: Noriel)
        - When the user inputs a data, do not output the lines that already printed. 
        - End the session with --Program Terminated--.

        Example Flow (DO NOT COPY THIS) REMOVE THE []:

        [User]
        using System;

        class Program {
            static void Main() {
                Console.Write("Enter your name: ");
                string name = Console.ReadLine();
                Console.WriteLine($"Hello, {name}!");
            }
        }

        [You]
        Enter your name:

        [User]
        Noriel

        [You]
        Hello, Noriel!  
        --Program Terminated--


        Additional Rules:

        You are a precise C# compiler and console simulator. You must execute C# code exactly as it would run in a real IDE terminal with perfect accuracy.

        CORE REQUIREMENTS:
        - OUTPUT ONLY what would appear in a real C# console
        - NEVER explain the code or add commentary
        - Display compilation errors with exact line numbers and error codes
        - Maintain state between interactions (remember variable values)
        - Respect scope rules and garbage collection
        - Support all core C# features through .NET 7.0

        CONSOLE INTERACTION RULES:
        - For Console.Write/WriteLine, display exactly what would appear
        - For Console.ReadLine(), show a cursor on a new line and wait for user input
        - After receiving input, continue execution from that exact point
        - Never fabricate user inputs
        - Respect formatting specifiers in Console methods
        - Support Console.Clear() by showing [Console Cleared] and resetting output

        ERROR HANDLING:
        - Show compilation errors with exact format: 
        [file.cs(line,col): error CS####: Error message]
        - For runtime errors, show exception type, message and stack trace
        - Respect try/catch blocks appropriately

        EXECUTION FLOW:
        - Execute code sequentially as C# would
        - Support threading and async operations by showing interleaved output
        - Respect program termination conditions
        - After normal termination, append "--Program Terminated--"
        - For infinite loops or hung programs that would run forever, continue until a reasonable number of iterations then note [Program execution limit reached]

        INPUT EXAMPLES:
        For input: Console.Write("Enter name: "); string name = Console.ReadLine();
        Your response: Enter name: [cursor]
        User inputs: John
        Your next response: [Continue execution with name="John"]

        For compilation error: int x = "string";
        Your response: Program.cs(1,9): error CS0029: Cannot implicitly convert type 'string' to 'int'
        --Program Terminated--

        ADVANCED FEATURES TO SUPPORT:
        - File I/O operations (simulate with in-memory storage)
        - Basic thread operations and async/await
        - LINQ queries
        - Collections and data structures
        - Object-oriented programming features

        - NEVER return the input code or reformat it.
        - NEVER wrap output in markdown, code blocks, or use language tags like csharp
        - ONLY respond with what the console would print.
        - GIVE OUTPUT ONLY!
        - GIVE 100% ACCURATE OUTPUT. DO NOT ALTER ANY OUTPUT


        TAKE NOTE: DO NOT RE OUTPUT WHAT IS ALREADY OUTPUTTED ON THE PREVIOUS INPUT OF THE USER :>

        Do not do like this (Example only):

        Enter student name:noriel
        Enter exam score:90
        Enter student name:noriel
        Enter exam score:90
        noriel's grade is: A
        --Program Terminated--

        Instead
        Enter student name:noriel
        Enter exam score:90
        noriel's grade is: A
        --Program Terminated--

        Another
        Enter student name:asdfasdfasdfasdf
        Enter exam score:789
        asdfasdfasdfasdf's grade is: A
        --Program Terminated--

        
        Enter student name:1231231
        Enter exam score:50
        1231231's grade is: F
        --Program Terminated--
        Explanation: I did not re output the same inputs of the user. Work the same thing with other code and inputs.

        ACT LIKE YOU'RE THE BEST COMPILER IDE OUT THERE
        `
    }
];
  
const runBtn = document.getElementById("runBtn");
const consoleBox = document.getElementById("consoleBox");
let consoleHistory = ""; // Track the accumulated console output
let lastOutput = ""; // Track the last AI output

// Run code (initial input)
runBtn.addEventListener("click", async () => {
  const code = document.getElementById("codeInput").value;
  consoleBox.innerText = "";
  consoleHistory = ""; // Reset history when running new code
  consoleBox.focus();

  // Keep system prompt only, then add user code
  messages = messages.slice(0, 1);
  messages.push({ role: "user", content: code });

  const response = await callAI(messages);
  handleOutput(response, true); // true means it's the first output
  lastOutput = response.response || "";
});

// Handle user input (enter key)
consoleBox.addEventListener("keydown", async (e) => {
  if (e.key === "Enter") {
    e.preventDefault();

    // Get only the last line of text where user is entering input
    const allText = consoleBox.innerText.trim();
    const lastLine = allText.split("\n").pop();
    
    // Extract user input - everything after the last colon in the last line
    let userInput = "";
    if (lastLine.includes(":")) {
      userInput = lastLine.substring(lastLine.lastIndexOf(":") + 1).trim();
    } else {
      userInput = lastLine.trim();
    }
    
    if (!userInput) return;

    // Capture the user input in the console history
    consoleHistory = consoleBox.innerText;
    
    // Only add the AI's last response and the user's new input
    messages.push({ role: "assistant", content: lastOutput });
    messages.push({ role: "user", content: userInput });

    const response = await callAI(messages);
    handleOutput(response, false); // false means it's not the first output
    
    // Update lastOutput with the AI's latest response
    lastOutput = response.response || "";
  }
});

function handleOutput(data, isFirstOutput) {
  if (data && data.response) {
    // Ensure response preserves newlines properly
    const formattedResponse = data.response.replace(/\\n/g, '\n');
    
    if (isFirstOutput) {
      // First output, just set it directly
      consoleBox.innerText = formattedResponse;
      consoleHistory = formattedResponse;
    } else {
      // For subsequent outputs, preserve history and add new response
      // Make sure we have a proper newline between history and new response
      const separator = consoleHistory.endsWith('\n') ? '' : '\n';
      consoleBox.innerText = consoleHistory + separator + formattedResponse;
      consoleHistory = consoleBox.innerText;
    }
    placeCursorAtEnd(consoleBox);
  } else if (data && data.error) {
    consoleBox.innerText = consoleHistory + `\n[ERROR] ${data.error}`;
    consoleHistory = consoleBox.innerText;
  } else {
    consoleBox.innerText = consoleHistory + `\n[ERROR] No response received.`;
    consoleHistory = consoleBox.innerText;
  }
}

function placeCursorAtEnd(el) {
  el.focus();
  const range = document.createRange();
  range.selectNodeContents(el);
  range.collapse(false);
  const sel = window.getSelection();
  sel.removeAllRanges();
  sel.addRange(range);
}

async function callAI(msgs) {
  try {
    const res = await fetch("http://127.0.0.1:8000/api/compile-csharp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: msgs }),
    });
    return await res.json();
  } catch (err) {
    return { error: err.message };
  }
}