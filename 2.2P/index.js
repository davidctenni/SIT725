const express = require('express')
const app = express()
const port = 3000

// Serve files from public 
app.use(express.static('public'))

// Calculator endpoint
app.get('/add/:num1/:num2/:operation', (req, res) => {
    console.log('Endpoint hit with parameters:', req.params) // Log all parameters
    
    const num1 = parseFloat(req.params.num1)
    const num2 = parseFloat(req.params.num2)
    const operation = parseInt(req.params.operation)
    
    console.log('Parsed values:', {
        num1: num1,
        num2: num2,
        operation: operation,
        'operation type': typeof operation
    })
    
    let result;
    //this is fed in when the numbers are added to the url
    switch(operation) {
        case 1:
            console.log('Addition case')
            result = num1 + num2
            break;
        case 2:
            console.log('Subtraction case')
            result = num1 - num2
            break;
        case 3:
            console.log('Multiplication case')
            result = num1 * num2
            break;
        case 4:
            console.log('Division case')
            result = num1 / num2
            break;
        default:
            result = "Oi Quit Hacking"
    }

    console.log('Final result:', result)
    res.json({ result: result })
})

// Start server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`)
})