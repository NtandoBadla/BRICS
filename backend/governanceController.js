const prisma = require('../prisma');

// --- Document Management ---

// @desc    Upload/Create a document record
// @route   POST /api/governance/documents
// @access  Private (Admin, Secretariat)
const createDocument = async (req, res) => {
    const { name, type, fileUrl, entityType, entityId } = req.body;
    const { userId } = req.user;

    if (!name || !type || !fileUrl) {
        return res.status(400).json({ error: 'Document name, type, and fileUrl are required.' });
    }

    try {
        const document = await prisma.document.create({
            data: {
                name,
                type,
                fileUrl,
                entityType,
                entityId,
                status: 'PENDING_APPROVAL',
                createdBy: userId,
            }
        });
        res.status(201).json(document);
    } catch (error) {
        console.error('Failed to create document:', error);
        res.status(500).json({ error: 'Could not create document.' });
    }
};

// @desc    Get all documents
// @route   GET /api/governance/documents
// @access  Private
const getDocuments = async (req, res) => {
    try {
        const documents = await prisma.document.findMany({
            include: {
                creator: { select: { firstName: true, lastName: true } },
                approver: { select: { firstName: true, lastName: true } }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(documents);
    } catch (error) {
        console.error('Failed to fetch documents:', error);
        res.status(500).json({ error: 'Could not fetch documents.' });
    }
};

// @desc    Approve a document
// @route   PUT /api/governance/documents/:id/approve
// @access  Private (Admin, Secretariat)
const approveDocument = async (req, res) => {
    const { id } = req.params;
    const { userId } = req.user;

    try {
        const updatedDocument = await prisma.document.update({
            where: { id },
            data: {
                status: 'APPROVED',
                approvedBy: userId,
            }
        });
        res.json(updatedDocument);
    } catch (error) {
        console.error(`Failed to approve document ${id}:`, error);
        if (error.code === 'P2025') {
            return res.status(404).json({ error: 'Document not found.' });
        }
        res.status(500).json({ error: 'Could not approve document.' });
    }
};


// --- Secretariat Workflow (Tasks) ---

// @desc    Create a task (WorkflowInstance)
// @route   POST /api/governance/tasks
// @access  Private (Admin, Secretariat)
const createTask = async (req, res) => {
    const { workflowId, entityType, entityId } = req.body;
    const { userId } = req.user;

    if (!workflowId || !entityType || !entityId) {
        return res.status(400).json({ error: 'Workflow ID, entity type, and entity ID are required.' });
    }

    try {
        const task = await prisma.workflowInstance.create({
            data: {
                workflowId,
                entityType,
                entityId,
                submittedBy: userId,
                status: 'PENDING',
                currentStep: 1,
            }
        });
        res.status(201).json(task);
    } catch (error) {
        console.error('Failed to create task:', error);
        res.status(500).json({ error: 'Could not create task.' });
    }
};

// @desc    Get all tasks
// @route   GET /api/governance/tasks
// @access  Private
const getTasks = async (req, res) => {
    try {
        const tasks = await prisma.workflowInstance.findMany({
            include: {
                workflow: { select: { name: true } },
                submitter: { select: { firstName: true, lastName: true } }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(tasks);
    } catch (error) {
        console.error('Failed to fetch tasks:', error);
        res.status(500).json({ error: 'Could not fetch tasks.' });
    }
};

module.exports = {
    createDocument,
    getDocuments,
    approveDocument,
    createTask,
    getTasks,
};