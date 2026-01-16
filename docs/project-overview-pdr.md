# Project Overview & Product Development Requirements (PDR)

## Project Vision
To build a comprehensive Commune Management Application for **UBND xã Diễn Sanh** (Hải Lăng, Quảng Trị). The application aims to modernize commune administration, improve communication between the government and citizens, and provide offline-capable tools for rural connectivity.

## Core Goals
- **Digital Transformation**: Modernize administrative tasks and data management for 18 villages and 2 residential areas (20 villages total).
- **Accessibility**: Provide a mobile-first, offline-capable Progressive Web App (PWA) for village leaders and citizens.
- **Enhanced Communication**: Implement a multi-channel messaging system (SMS/Chatbot) for timely notifications and public service information.
- **Data Security**: Securely manage resident data (including CCCD/ID information) with encryption and role-based access control.

## Key Features
- **Multi-role Access Control**:
  - **Commune Admin**: Full system access, data management, and SMS broadcasting.
  - **Village Leader**: Manage village residents, task assignments, and local communications.
  - **Public**: Access to public service procedures, administrative information, and AI-powered chatbot assistance.
- **Resident & Household Management**: Comprehensive database of residents, grouped by households and villages.
- **SMS Notification System**: Integrated SMS provider abstraction (VNPT/eSMS/Stringee) for broadcasting urgent news and administrative reminders.
- **AI-Powered Public Portal**: RAG-based (Retrieval-Augmented Generation) chatbot to assist citizens with public service procedures and local regulations.
- **Offline Capabilities**: Full PWA support allowing village leaders to access and update data in areas with poor internet connectivity.
- **Task Assignment**: Workflow management for commune admins to assign and track tasks for village leaders.

## Success Metrics
- 100% adoption by village leaders (20 villages).
- Significant reduction in time taken for commune-wide notifications.
- Improved accuracy of resident data management compared to traditional paper/Excel systems.
- High citizen satisfaction with the AI chatbot's ability to answer public service queries.
- **WCAG AAA** contrast compliance for all UI components.

## Technical Constraints
- **Language**: Vietnamese (primary UI and data).
- **Compliance**: Adherence to Vietnamese cybersecurity and data protection regulations (especially regarding CCCD data).
- **Environment**: Optimized for low-bandwidth and intermittent internet connections.
- **Accessibility**: 18px base font size requirement for elderly accessibility.
