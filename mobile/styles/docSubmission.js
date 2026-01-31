import {StyleSheet} from 'react-native';


export const styles = StyleSheet.create({ safeArea: { flex: 1, backgroundColor: '#fff' },
  container: { flex: 1 },
  scrollContent: { paddingBottom: 40 },
  header: { alignItems: 'center', paddingTop: 40, paddingBottom: 20 },
  logoCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#2563eb', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  logoText: { fontSize: 32, fontFamily: 'Poppins-Bold', color: '#fff' },
  title: { fontSize: 36, fontFamily: 'Poppins-Bold', color: '#1e293b', marginBottom: 8 },
  subtitle: { fontSize: 14, fontFamily: 'Poppins-Regular', color: '#64748b', textAlign: 'center', paddingHorizontal: 24 },
  section: { paddingHorizontal: 24, paddingTop: 32 },
  sectionTitle: { fontSize: 22, fontFamily: 'Poppins-Bold', color: '#1e293b', marginBottom: 16 },
  
  templateSection: { marginBottom: 20 },
  templateLabel: { fontSize: 16, fontFamily: 'Poppins-SemiBold', color: '#1e293b', marginBottom: 8 },
  templateSelector: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  templateSelectorContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  templateSelectorText: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#1e293b',
    flex: 1,
  },
  loadingTemplate: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
  },
  loadingTemplateText: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#64748b',
    marginLeft: 8,
  },
  
  statusHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  uploadButton: { 
    borderWidth: 2, 
    borderColor: '#2563eb', 
    borderRadius: 12, 
    borderStyle: 'dashed', 
    paddingVertical: 32, 
    alignItems: 'center', 
    backgroundColor: '#f8fafc' 
  },
  uploadButtonText: { fontSize: 16, fontFamily: 'Poppins-SemiBold', color: '#2563eb', marginTop: 8 },
  uploadHelpText: { 
    fontSize: 12, 
    fontFamily: 'Poppins-Regular', 
    color: '#94a3b8', 
    marginTop: 4,
    textAlign: 'center',
    paddingHorizontal: 16
  },
  
  // New styles for multiple files
  filesContainer: { marginTop: 16 },
  filesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  filesHeaderText: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: '#1e293b',
  },
  clearAllText: {
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
    color: '#ef4444',
  },
  
  fileCard: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#f1f5f9', 
    borderRadius: 12, 
    padding: 12, 
    marginBottom: 8
  },
  previewImage: { width: 60, height: 60, borderRadius: 8, marginRight: 12 },
  fileIconContainer: { 
    width: 60, 
    height: 60, 
    borderRadius: 8, 
    backgroundColor: '#e2e8f0', 
    justifyContent: 'center', 
    alignItems: 'center',
    marginRight: 12 
  },
  fileInfo: { flex: 1 },
  fileName: { fontSize: 14, fontFamily: 'Poppins-SemiBold', color: '#1e293b' },
  fileSize: { fontSize: 12, fontFamily: 'Poppins-Regular', color: '#94a3b8', marginTop: 2 },
  submitButton: { backgroundColor: '#2563eb', borderRadius: 12, marginTop: 16 },
  loadingContainer: { alignItems: 'center', paddingVertical: 32 },
  loadingText: { marginTop: 16, fontSize: 14, fontFamily: 'Poppins-Regular', color: '#64748b' },
  loadingSubtext: { marginTop: 4, fontSize: 12, fontFamily: 'Poppins-Regular', color: '#94a3b8' },
  resultCard: { backgroundColor: '#fff', borderRadius: 16, padding: 20, marginTop: 16, borderWidth: 1, borderColor: '#e2e8f0' },
  resultHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  statusText: { fontSize: 20, fontFamily: 'Poppins-Bold', marginLeft: 8 },
  scoreContainer: { alignItems: 'center', paddingVertical: 20, borderTopWidth: 1, borderBottomWidth: 1, borderColor: '#e2e8f0' },
  scoreLabel: { fontSize: 14, fontFamily: 'Poppins-Regular', color: '#64748b', marginBottom: 8 },
  scoreValue: { fontSize: 48, fontFamily: 'Poppins-Bold' },
  resetButton: { marginTop: 16 },
  emptyCard: { backgroundColor: '#f8fafc', borderRadius: 12, alignItems: 'center', paddingVertical: 32 },
  emptyText: { fontSize: 16, fontFamily: 'Poppins-SemiBold', color: '#64748b', marginTop: 8 },
  emptySubtext: { fontSize: 14, fontFamily: 'Poppins-Regular', color: '#94a3b8', marginTop: 4 },
  submissionCard: { backgroundColor: '#fff', borderRadius: 12, marginBottom: 12, elevation: 2 },
  submissionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  submissionTitleRow: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  submissionInfo: { flex: 1, marginLeft: 8 },
  submissionTitle: { fontSize: 16, fontFamily: 'Poppins-SemiBold', color: '#1e293b' },
  submissionDate: { fontSize: 12, fontFamily: 'Poppins-Regular', color: '#94a3b8', marginTop: 2 },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  statusBadgeText: { fontSize: 12, fontFamily: 'Poppins-SemiBold' },
  submissionDetails: { borderTopWidth: 1, borderTopColor: '#e2e8f0', paddingTop: 12 },
  submissionDetailRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  submissionDetailLabel: { fontSize: 14, fontFamily: 'Poppins-Regular', color: '#64748b' },
  submissionDetailValue: { fontSize: 14, fontFamily: 'Poppins-SemiBold', color: '#1e293b' },

predictionLabel: {
  fontSize: 12,
  color: '#64748b',
  marginTop: 4,
  textAlign: 'center',
},

adminNotesContainer: {
  marginTop: 12,
  padding: 12,
  backgroundColor: '#f1f5f9',
  borderRadius: 8,
  borderLeftWidth: 3,
  borderLeftColor: '#2563eb',
},

adminNotesLabel: {
  fontSize: 12,
  fontWeight: '600',
  color: '#475569',
  marginBottom: 4,
},

adminNotesText: {
  fontSize: 13,
  color: '#1e293b',
  lineHeight: 18,
},
});
