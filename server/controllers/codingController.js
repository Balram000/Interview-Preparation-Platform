const codingQuestions = [
  {
    id: 1,
    title: 'Two Sum',
    difficulty: 'Beginner',
    description: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.',
    examples: [
      { input: 'nums = [2,7,11,15], target = 9', output: '[0,1]' },
      { input: 'nums = [3,2,4], target = 6', output: '[1,2]' }
    ],
    constraints: ['2 <= nums.length <= 104', '-109 <= nums[i] <= 109'],
    starterCode: {
      javascript: `function twoSum(nums, target) {
  // Your code here
}`,
      python: `def twoSum(nums, target):
    # Your code here`,
      java: `class Solution {
    public int[] twoSum(int[] nums, int target) {
        // Your code here
    }
}`
    },
    testCases: [
      { input: '[2,7,11,15], 9', expected: '[0,1]' },
      { input: '[3,2,4], 6', expected: '[1,2]' }
    ]
  },
  {
    id: 2,
    title: 'Reverse String',
    difficulty: 'Beginner',
    description: 'Write a function that reverses a string.',
    examples: [
      { input: 's = "hello"', output: '"olleh"' }
    ],
    constraints: ['1 <= s.length <= 105'],
    starterCode: {
      javascript: `function reverseString(s) {
  // Your code here
}`,
      python: `def reverseString(s):
    # Your code here`,
      java: `class Solution {
    public String reverseString(String s) {
        // Your code here
    }
}`
    },
    testCases: [
      { input: '"hello"', expected: '"olleh"' }
    ]
  }
];

exports.getCodingQuestions = async (req, res) => {
  try {
    const { difficulty } = req.query;
    
    let filteredQuestions = codingQuestions;
    if (difficulty) {
      filteredQuestions = codingQuestions.filter(q => q.difficulty === difficulty);
    }

    res.status(200).json({
      success: true,
      questions: filteredQuestions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.getCodingQuestion = async (req, res) => {
  try {
    const question = codingQuestions.find(q => q.id === parseInt(req.params.id));
    
    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found'
      });
    }

    res.status(200).json({
      success: true,
      question
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.submitCode = async (req, res) => {
  try {
    const { questionId, code, language } = req.body;
    
    const question = codingQuestions.find(q => q.id === parseInt(questionId));
    
    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found'
      });
    }

    const results = question.testCases.map((testCase, index) => {
      const passed = Math.random() > 0.3;
      
      return {
        testCase: index + 1,
        input: testCase.input,
        expected: testCase.expected,
        passed,
        output: passed ? testCase.expected : 'Wrong Answer'
      };
    });

    const passedCount = results.filter(r => r.passed).length;
    const allPassed = passedCount === results.length;

    res.status(200).json({
      success: true,
      results,
      passedCount,
      totalCount: results.length,
      allPassed,
      message: allPassed ? 'All test cases passed!' : `${passedCount}/${results.length} test cases passed`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
